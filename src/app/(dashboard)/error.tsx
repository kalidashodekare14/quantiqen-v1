"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import AppButton from "@/components/shared/AppButton";
import { fadeInUp } from "@/lib/motion";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  return (
    <motion.div
      {...fadeInUp()}
      className="bg-background relative flex min-h-screen items-center justify-center"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-chart-500/20 size-125 rounded-full blur-[120px] sm:size-175" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <motion.div {...fadeInUp()}>
          <AlertTriangle className="text-destructive size-16" />
        </motion.div>

        <motion.div {...fadeInUp(0.2)} className="flex flex-col items-center gap-2">
          <h1 className="text-foreground text-xl font-semibold lg:text-2xl">
            Something went wrong
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </motion.div>

        <motion.div {...fadeInUp(0.4)} className="flex items-center gap-3">
          <AppButton variant="outline" onClick={reset}>
            Try Again
          </AppButton>
          <AppButton variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </AppButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
