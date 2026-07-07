"use client";

import { motion } from "framer-motion";
import { Brain, Clock, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { AIDecisionResponse } from "@/types/ai-engine.types";
import { severityStyles } from "@/constants/severity";
import { fadeInUp } from "@/lib/motion";
import AppButton from "@/components/shared/AppButton";

interface AIAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AIDecisionResponse | null | undefined;
  isError: boolean;
  isPending: boolean;
  onRetry: () => void;
}

const AIAnalysisModal = ({
  open,
  onOpenChange,
  result,
  isError,
  isPending,
  onRetry,
}: AIAnalysisModalProps) => {
  const decision = result?.decisions[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 border-foreground/10 gap-0 p-0 backdrop-blur-xl sm:max-w-lg">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Brain className="text-primary size-5" />
            AI Analysis Result
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Powered by QUANTIQEN AI</span>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          {isPending && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="relative size-12">
                <div className="border-primary/20 border-t-primary absolute inset-0 animate-spin rounded-full border-2" />
                <Brain className="text-primary absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-muted-foreground animate-pulse text-sm">
                Analyzing with AI engine...
              </p>
            </div>
          )}

          {isError && (
            <motion.div
              {...fadeInUp()}
              className="bg-destructive/10 border-destructive/20 rounded-xl border p-6"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertTriangle className="text-destructive size-8" />
                <div>
                  <p className="text-destructive text-sm font-medium">Analysis Failed</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Could not connect to AI engine. Please try again.
                  </p>
                </div>
                <AppButton variant="outline" size="md" fullWidth onClick={onRetry}>
                  Retry
                </AppButton>
              </div>
            </motion.div>
          )}

          {result && !isPending && (
            <motion.div {...fadeInUp()} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border-foreground/10 rounded-xl border p-4">
                  <p className="text-muted-foreground mb-1 text-xs">Risk Score</p>
                  <p className="text-primary text-3xl font-bold">{result.overall_risk_score}</p>
                </div>
                <div className="bg-card border-foreground/10 rounded-xl border p-4">
                  <p className="text-muted-foreground mb-1 text-xs">Priority Level</p>
                  {decision?.priority && (
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                        severityStyles[decision.priority]
                      }`}
                    >
                      {decision.priority}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-card-foreground mb-2 text-base font-semibold">
                  AI Decision Summary
                </p>
                <p className="text-card-foreground text-sm leading-relaxed">{result.summary}</p>
              </div>

              <div>
                <p className="text-card-foreground mb-2 text-base font-semibold">
                  Recommended Action
                </p>
                <p className="text-card-foreground text-sm leading-relaxed">
                  {decision?.recommendation}
                </p>
              </div>

              <div>
                <p className="text-card-foreground mb-2 text-base font-semibold">
                  Remediation Timeline
                </p>
                <p className="text-card-foreground flex items-center gap-2 text-sm">
                  <Clock className="text-muted-foreground size-4" />
                  {decision?.timeline}
                </p>
              </div>

              {result.processing_time !== undefined && (
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <span>Processed in {result.processing_time}s</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAnalysisModal;
