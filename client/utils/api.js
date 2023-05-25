import axios from "axios";

export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({
  baseURL: "http://localhost:5000",
});

let accessToken = "";

api.interceptors.request.use(
  (config) => {
    console.log(config);
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.config.url.startsWith("/verify-email")) {
      return Promise.reject(error);
    }
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      console.log("Check error.response:", error.response);
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
        console.error("Error: ", e);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
