import axios from "axios";
import { tokenManager } from "./token-manager";

let csrfToken: string | null = null;

function getCsrfToken(): string | null {
  return csrfToken;
}

let csrfSeeded = false;
let csrfSeedPromise: Promise<void> | null = null;

export function seedCsrfToken(): Promise<void> {
  if (csrfSeeded || typeof document === "undefined") return Promise.resolve();
  if (csrfSeedPromise) return csrfSeedPromise;

  csrfSeedPromise = (async () => {
    try {
      const res = await api.get("/health");
      csrfToken = res.data?.csrfToken ?? null;
    } catch {
      /* ignore — will fail closed on first POST anyway */
    }
    csrfSeeded = true;
  })();

  return csrfSeedPromise;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = tokenManager.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = config.method?.toUpperCase();
  if (method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE") {
    const csrf = getCsrfToken();
    if (csrf) {
      config.headers["x-csrf-token"] = csrf;
    }
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error || !token) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
        null,
        { withCredentials: true },
      );
      const { accessToken: newToken } = res.data;
      tokenManager.set(newToken);
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenManager.clear();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
