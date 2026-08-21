"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import AppLoading from "@/components/shared/AppLoading";

export default function Home() {
  const { isAuthenticated, attemptSilentRefresh } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
      return;
    }

    attemptSilentRefresh().then((success) => {
      if (success) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
      setReady(true);
    });
  }, [isAuthenticated, attemptSilentRefresh, router]);

  if (!ready) {
    return <AppLoading />;
  }

  return null;
}
