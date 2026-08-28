"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import AppLoading from "@/components/shared/AppLoading";

export default function Home() {
  const { isAuthenticated, attemptSilentRefresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    attemptSilentRefresh().then((success) => {
      if (success) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    });
  }, [isAuthenticated, attemptSilentRefresh, router]);

  if (isAuthenticated) {
    return null;
  }

  return <AppLoading />;
}
