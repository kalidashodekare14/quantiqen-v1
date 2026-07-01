"use client";

import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import AppButton from "@/components/shared/AppButton";
import { fadeInUp } from "@/lib/motion";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html>
      <body className="bg-background text-foreground">
        <motion.div
          {...fadeInUp()}
          className="relative flex min-h-screen items-center justify-center"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-chart-500/20 size-125 rounded-full blur-[120px] sm:size-175" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <motion.div {...fadeInUp()}>
              <ShieldAlert className="text-destructive size-16" />
            </motion.div>

            <motion.div {...fadeInUp(0.2)} className="flex flex-col items-center gap-2">
              <h1 className="text-foreground text-2xl font-bold lg:text-3xl">Critical Error</h1>
              <p className="text-muted-foreground max-w-sm text-sm">
                {error.message ||
                  "A critical error has occurred. Please refresh the page or contact support."}
              </p>
            </motion.div>

            <motion.div {...fadeInUp(0.4)} className="flex items-center gap-3">
              <AppButton onClick={reset}>Refresh Page</AppButton>
              <AppButton
                variant="outline"
                onClick={() => window.open("mailto:operations@anantnetra.com", "_self")}
              >
                Contact Support
              </AppButton>
            </motion.div>
          </div>
        </motion.div>
      </body>
    </html>
  );
}
