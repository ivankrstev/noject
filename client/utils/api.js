import axios from "axios";

export const setAccessToken = (token) => {
  accessToken = token;
};

const api = axios.create({
  baseURL: "http://localhost:5000",
});

let accessToken = "";

const excludedRoutes = ["/verify-email", "/login", "/signup", "/tfa/verify", "/refresh-token"];

api.interceptors.request.use(
  (config) => {
    const isExcluded = excludedRoutes.some((route) => config.url.startsWith(route));
    if (isExcluded) return config;
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Added excluding for specific routes(in order to use only the api function for requests)
    const isExcluded = excludedRoutes.some((route) => error.config.url.startsWith(route));
    if (isExcluded) return Promise.reject(error);
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
        if (e.response.status === 401) e.logInAgain = true;
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
