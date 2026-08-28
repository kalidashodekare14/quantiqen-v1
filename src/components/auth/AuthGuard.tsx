"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AppLoading from "../shared/AppLoading";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const { isAuthenticated, attemptSilentRefresh } = useAuth();
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  useEffect(() => {
    if (isAuthenticated || refreshAttempted) return;
    attemptSilentRefresh().finally(() => setRefreshAttempted(true));
  }, [isAuthenticated, attemptSilentRefresh, refreshAttempted]);

  useEffect(() => {
    if (refreshAttempted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [refreshAttempted, isAuthenticated, router]);

  if (!refreshAttempted && !isAuthenticated) {
    return <AppLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
