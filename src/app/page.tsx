"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-background flex min-h-screen items-center justify-center"
    >
      <div className="flex flex-col items-center gap-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-primary text-5xl font-bold tracking-widest sm:text-6xl"
        >
          QUANTIQEN
        </motion.h1>

        <div className="bg-primary/20 h-0.75 w-50 overflow-hidden rounded-full">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="bg-primary h-full w-full rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
