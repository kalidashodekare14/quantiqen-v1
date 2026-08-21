"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useHealthCheck } from "../hooks/useHealthCheck";

const slideInRight = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

const HealthBanner = () => {
  const { isError } = useHealthCheck();

  if (!isError) return null;

  return (
    <motion.div
      {...slideInRight}
      className="border-destructive/20 bg-destructive/10 flex w-full flex-col items-center justify-between gap-3 rounded-xl border p-3 lg:flex-row lg:gap-0"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-destructive size-5 shrink-0" />
        <p className="text-destructive text-sm">
          AI Engine Unavailable — Cannot connect to backend. Analysis is disabled.
        </p>
      </div>
      <span className="text-muted-foreground text-xs">Retrying every 30 seconds...</span>
    </motion.div>
  );
};

export default HealthBanner;
