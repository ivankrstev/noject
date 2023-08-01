import axios from "axios";

export const setAccessToken = (token) => {
  accessToken = token;
};

// Create api interceptor only for authenticated routes
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
});

let accessToken = "";

api.interceptors.request.use(
  (config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response) return Promise.reject(error);
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(
          "http://localhost:5000/refresh-token",
          {},
          {
            withCredentials: true,
          }
        );
        accessToken = response.data.accessToken;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (e) {
        if (e.response?.status === 401) e.logInAgain = true;
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
