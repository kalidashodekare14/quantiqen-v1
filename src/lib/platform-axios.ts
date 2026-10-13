import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";

import { refreshAccessToken } from "./refresh-token";
import { tokenManager } from "./token-manager";

export const platformApi = axios.create({
  baseURL: "/platform",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

platformApi.interceptors.request.use((config) => {
  const token = tokenManager.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

platformApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry || !originalRequest) {
      if (error.response?.status === 403) {
        const method = (originalRequest?.method ?? "get").toUpperCase();
        if (method !== "GET" && method !== "HEAD") {
          toast.error("You don't have permission to perform this action");
        }
      }
      return Promise.reject(error);
    }

    const sentAuth = originalRequest.headers?.Authorization as string | undefined;
    const currentToken = tokenManager.get();
    const currentAuth = currentToken ? `Bearer ${currentToken}` : undefined;

    if (sentAuth && currentAuth && sentAuth !== currentAuth) {
      originalRequest.headers = { ...originalRequest.headers, Authorization: currentAuth };
      return platformApi(originalRequest);
    }

    originalRequest._retry = true;

    try {
      const token = await refreshAccessToken();
      originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
      return platformApi(originalRequest);
    } catch (refreshError) {
      tokenManager.clear();
      return Promise.reject(refreshError);
    }
  },
);
