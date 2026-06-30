"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState<string | null>("");
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);
  }, []);

  if (token) {
    return router.push("/dashboard");
  } else {
    return router.push("/login");
  }

  return (
    <div>
      <h1>Quantiqen v1</h1>
    </div>
  );
}
