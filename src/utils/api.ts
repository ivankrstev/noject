import { AuthReloginError } from "@/types";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

/**
 * Authentication token storage and API client configuration
 *
 * This module provides:
 * 1. Token management functions (get/set)
 * 2. A pre-configured Axios instance with authentication interceptors
 * 3. Automatic token refresh on 401 errors
 * 4. Error handling for authentication failures
 */

// Store the JWT access token in memory
let accessToken = "";

/**
 * Sets the JWT access token for API requests
 * @param token - The JWT access token string
 */
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

/**
 * Retrieves the current access token or attempts to refresh it
 * @returns The JWT access token or null if refresh fails
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (accessToken) return accessToken;
  try {
    // Attempt to refresh the token
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/refresh-token`,
      {},
      {
        withCredentials: true,
      }
    );
    // Update the in-memory token
    setAccessToken(response.data.access_token);
    return response.data.access_token;
  } catch {
    return null;
  }
};

// Create a pre-configured Axios instance for authenticated API requests
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
});

// Extended request config interface to track retry attempts
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Request interceptor
 * Automatically adds the Authorization header with the JWT token to all requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add the Authorization header if we have a token
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  // Reject the promise with the error if the request fails
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
);

/**
 * Response interceptor
 * Handles 401 Unauthorized errors by:
 * 1. Attempting to refresh the token
 * 2. Retrying the original request with the new token
 * 3. Marking authentication failures for re-login if refresh fails
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: CustomRequestConfig }): Promise<unknown> => {
    // Check if the error has a config object (original request), if not, it's a network error
    // if (!error.config) return Promise.reject(error);
    // Access the original request config object, typecasted to our custom config type
    const originalRequest = error.config as CustomRequestConfig;
    // Check if the error has a response object (HTTP error), if not, it's a network error
    if (!error.response) return Promise.reject(error);

    // Handle 401 Unauthorized errors (expired token)
    // Check if the error is a 401 Unauthorized error, if not, it's not an authentication error
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear the in-memory token to force a refresh
        accessToken = "";
        // Attempt to refresh the token
        const token = await getAccessToken();
        // Check if the refresh was successful, if not, throw an error
        if (!token) throw new Error("Failed to get a new token");
        // Update token and retry the original request
        accessToken = token;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (e) {
        // Mark authentication failures for re-login if refresh fails
        const customError = e as AuthReloginError;
        if (customError.response?.status === 401) customError.logInAgain = true;
        return Promise.reject(customError);
      }
    }
    // If not a 401 error, reject the promise with the original error
    return Promise.reject(error);
  }
);

export default api;
