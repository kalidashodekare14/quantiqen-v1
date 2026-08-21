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
    if (isAuthenticated) {
      setRefreshAttempted(true);
      return;
    }

    if (refreshAttempted) return;

    attemptSilentRefresh().finally(() => setRefreshAttempted(true));
  }, [isAuthenticated, attemptSilentRefresh, refreshAttempted]);

  if (!refreshAttempted) {
    return <AppLoading />;
  }

  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  return <>{children}</>;
};
