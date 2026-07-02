"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import AppLoading from "../shared/AppLoading";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setStatus("authenticated");
    } else {
      setStatus("unauthenticated");
      router.replace("/login");
    }
  }, [router]);

  if (status === "checking") {
    return <AppLoading />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
};
