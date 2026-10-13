import axios from "axios";

import { tokenManager } from "./token-manager";

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = axios
    .post("/api/v1/auth/refresh", null, { withCredentials: true })
    .then((res) => {
      const token: string | undefined = res.data?.accessToken;
      if (!token) {
        throw new Error("Refresh response did not include an access token");
      }
      tokenManager.set(token);
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
