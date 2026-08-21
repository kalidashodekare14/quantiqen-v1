"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import AppButton from "@/components/shared/AppButton";
import { fadeInUp } from "@/lib/motion";

interface AIDecisionErrorProps {
  onRetry: () => void;
}

const AIDecisionError = ({ onRetry }: AIDecisionErrorProps) => {
  return (
    <motion.div
      {...fadeInUp()}
      className="bg-destructive/10 border border-destructive/20 rounded-xl p-4"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <AlertTriangle className="size-8 text-destructive" />

        <div>
          <p className="text-sm text-destructive font-medium">Analysis Failed</p>
          <p className="text-xs text-muted-foreground mt-1">
            Could not connect to AI engine. Please try again.
          </p>
        </div>

        <AppButton variant="outline" size="md" fullWidth onClick={onRetry}>
          Retry
        </AppButton>
      </div>
    </motion.div>
  );
};

export default AIDecisionError;
