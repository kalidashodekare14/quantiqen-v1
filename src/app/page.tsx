"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppLoading from "@/components/shared/AppLoading";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [token, isLoading, router]);

  return <AppLoading />;
}
