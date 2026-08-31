"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/auth.service";
import { tokenManager } from "./token-manager";
import { seedCsrfToken } from "./axios";
import { decodeCustomerJWT } from "./jwt";
import type { CustomerJWTPayload, LoginStepUp } from "@/types/auth.types";

export type AuthScreen = "login" | "change-password" | "step-up";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: CustomerJWTPayload | null;
  pendingScreen: AuthScreen;
  stepUpData: LoginStepUp | null;
  isLoggingOut: boolean;
  login: (orgId: string, userId: string, password: string, turnstileToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setPendingScreen: (screen: AuthScreen) => void;
  setStepUpData: (data: LoginStepUp | null) => void;
  attemptSilentRefresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return typeof window !== "undefined" && tokenManager.get() !== null;
  });
  const [user, setUser] = useState<CustomerJWTPayload | null>(null);
  const [pendingScreen, setPendingScreen] = useState<AuthScreen>("login");
  const [stepUpData, setStepUpData] = useState<LoginStepUp | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const setAccessToken = useCallback((token: string) => {
    tokenManager.set(token);
    const decoded = decodeCustomerJWT(token);
    setUser(decoded);
    setIsAuthenticated(true);
  }, []);

  const clearAuth = useCallback(() => {
    tokenManager.clear();
    setIsAuthenticated(false);
    setUser(null);
    setPendingScreen("login");
    setStepUpData(null);
  }, []);

  const silentRefreshRef = useRef<Promise<boolean> | null>(null);

  const attemptSilentRefresh = useCallback(async (): Promise<boolean> => {
    if (silentRefreshRef.current) return silentRefreshRef.current;

    silentRefreshRef.current = (async () => {
      try {
        await seedCsrfToken();
        const data = await authApi.refresh();
        tokenManager.set(data.accessToken);
        const decoded = decodeCustomerJWT(data.accessToken);
        setUser(decoded);
        setIsAuthenticated(true);
        return true;
      } catch {
        clearAuth();
        return false;
      } finally {
        silentRefreshRef.current = null;
      }
    })();

    return silentRefreshRef.current;
  }, [clearAuth]);

  useEffect(() => {
    seedCsrfToken().then(() => {
      if (tokenManager.get()) return;
      attemptSilentRefresh();
    });
  }, [attemptSilentRefresh]);

  const login = useCallback(
    async (orgId: string, userId: string, password: string, turnstileToken?: string) => {
      await seedCsrfToken();
      const response = await authApi.login({ orgId, userId, password }, turnstileToken);
      const res = response.data;

      if ("authenticated" in res && res.authenticated) {
        tokenManager.set(res.accessToken);
        const decoded = decodeCustomerJWT(res.accessToken);
        setUser(decoded);
        setIsAuthenticated(true);
        setStepUpData(null);

        if (res.mustChangePassword) {
          setPendingScreen("change-password");
        } else {
          router.push("/dashboard");
        }
        return;
      }

      if ("stepUpRequired" in res && res.stepUpRequired) {
        setStepUpData(res);
        setPendingScreen("step-up");
        return;
      }

      const responseData = response.data as unknown as Record<string, unknown>;
      const serverMessage = (responseData.message ?? responseData.error ?? "Login failed") as string;
      const err = new Error(serverMessage);
      (err as unknown as { response: { status: number; data: unknown } }).response = {
        status: response.status,
        data: response.data,
      };
      throw err;
    },
    [router],
  );

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      router.push("/login");
    }
  }, [clearAuth, router]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      pendingScreen,
      stepUpData,
      isLoggingOut,
      login,
      logout,
      setAccessToken,
      clearAuth,
      setPendingScreen,
      setStepUpData,
      attemptSilentRefresh,
    }),
    [
      isAuthenticated,
      user,
      pendingScreen,
      stepUpData,
      isLoggingOut,
      login,
      logout,
      setAccessToken,
      clearAuth,
      setPendingScreen,
      setStepUpData,
      attemptSilentRefresh,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
