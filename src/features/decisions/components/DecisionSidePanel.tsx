"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { AIDecisionItem } from "@/types/ai-engine.types";
import type { AIDecisionRequest } from "@/types/ai-engine.types";
import type { Finding } from "@/types/finding.types";
import { severityStyles } from "@/constants/severity";
import AppButton from "@/components/shared/AppButton";
import { useAIDecision } from "@/features/decisions/hooks/useAIDecision";
import AIDecisionResult from "@/features/decisions/components/AIDecisionResult";
import AIDecisionError from "@/features/decisions/components/AIDecisionError";

interface DecisionSidePanelProps {
  decision: AIDecisionItem | null;
  onClose: () => void;
  findings?: Finding[];
}

function getScoreTextColor(score: number): string {
  if (score > 80) return "text-destructive";
  if (score >= 60) return "text-chart-3";
  return "text-chart-2";
}

function getScoreBgColor(score: number): string {
  if (score > 80) return "bg-destructive";
  if (score >= 60) return "bg-chart-3";
  return "bg-chart-2";
}

const DecisionSidePanel = ({ decision, onClose, findings }: DecisionSidePanelProps) => {
  const { mutate, isPending, isError, data: aiResult, reset } = useAIDecision();

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const relatedFinding = findings?.find((f) => f.id === decision?.finding_id);

  const buildAIPayload = (dec: AIDecisionItem): AIDecisionRequest => {
    const finding = findings?.find((f) => f.id === dec.finding_id);
    return {
      organization: finding?.organization ?? "Acme Corp",
      findings: [
        {
          finding_id: dec.finding_id,
          title: finding?.title ?? dec.finding_id,
          description: finding?.description ?? "",
          severity: (finding?.severity ?? "medium") as "low" | "medium" | "high" | "critical",
          category: finding?.category ?? "vulnerability",
          affected_asset: finding?.affected_asset ?? "",
          asset_type: finding?.asset_type ?? "unknown",
        },
      ],
    };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (decision) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [decision, handleClose]);

  return (
    <AnimatePresence>
      {decision && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-black"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-card fixed inset-y-0 right-0 z-50 flex w-full flex-col sm:w-105"
          >
            <div className="border-border flex items-start justify-between gap-4 border-b px-6 py-5">
              <div className="min-w-0">
                <p className="text-card-foreground truncate text-lg font-semibold">
                  {relatedFinding?.title ?? decision.finding_id}
                </p>
                <p className="text-muted-foreground mt-0.5 truncate text-sm">
                  {decision.finding_id}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium lg:text-sm ${
                    severityStyles[decision.priority]
                  }`}
                >
                  {decision.priority}
                </span>
                {decision.business_impact && (
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium lg:text-sm ${
                      severityStyles[decision.business_impact as keyof typeof severityStyles] ??
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {decision.business_impact}
                  </span>
                )}
              </div>

              <hr className="border-border my-5" />

              <div>
                <p className="text-muted-foreground mb-1.5 text-sm font-medium tracking-wider uppercase lg:text-base">
                  Recommendation
                </p>
                <p className="text-card-foreground text-sm leading-relaxed lg:text-base">
                  {decision.recommendation}
                </p>
              </div>

              <hr className="border-border my-5" />

              <div>
                <p className="text-muted-foreground mb-1.5 text-sm font-medium tracking-wider uppercase lg:text-base">
                  Justification
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed lg:text-base">
                  {decision.justification ?? "No justification provided."}
                </p>
              </div>

              <hr className="border-border my-5" />

              {decision.technical_impact && (
                <>
                  <div>
                    <p className="text-muted-foreground mb-1.5 text-sm font-medium tracking-wider uppercase lg:text-base">
                      Technical Impact
                    </p>
                    <p className="text-card-foreground text-sm leading-relaxed lg:text-base">
                      {decision.technical_impact}
                    </p>
                  </div>
                  <hr className="border-border my-5" />
                </>
              )}

              {decision.risk_factors && decision.risk_factors.length > 0 && (
                <>
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase lg:text-base">
                      Risk Factors
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {decision.risk_factors.map((factor) => (
                        <span
                          key={factor}
                          className="bg-muted text-muted-foreground inline-block rounded-full px-2.5 py-0.5 text-xs lg:text-sm"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                  <hr className="border-border my-5" />
                </>
              )}

              <div>
                <p className="text-muted-foreground mb-3 text-sm font-medium tracking-wider uppercase lg:text-base">
                  Scores
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs lg:text-sm">Risk Score</p>
                    <p
                      className={`mt-1 text-xl font-semibold ${getScoreTextColor(decision.risk_score)}`}
                    >
                      {decision.risk_score}
                    </p>
                    <div className="bg-muted-foreground/20 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${getScoreBgColor(decision.risk_score)}`}
                        style={{ width: `${decision.risk_score}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs lg:text-sm">Confidence</p>
                    <p className="text-chart-2 mt-1 text-xl font-semibold">
                      {decision.confidence_score !== undefined
                        ? `${Math.round(decision.confidence_score * 100)}%`
                        : "—"}
                    </p>
                    <div className="bg-muted-foreground/20 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-chart-2 h-full rounded-full"
                        style={{
                          width: `${
                            decision.confidence_score !== undefined
                              ? decision.confidence_score * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-border my-5" />

              <div>
                <p className="text-muted-foreground mb-1.5 text-sm font-medium tracking-wider uppercase lg:text-base">
                  Remediation Timeline
                </p>
                <p className="text-card-foreground text-sm font-medium lg:text-base">
                  {decision.timeline}
                </p>
              </div>

              <hr className="border-border my-5" />

              <div className="space-y-4">
                {isPending && (
                  <div className="animate-pulse space-y-3">
                    <div className="bg-foreground/5 h-4 w-32 rounded" />
                    <div className="bg-foreground/5 h-3 w-full rounded" />
                    <div className="bg-foreground/5 h-3 w-3/4 rounded" />
                  </div>
                )}

                {isError && <AIDecisionError onRetry={() => reset()} />}

                {aiResult && <AIDecisionResult result={aiResult} onClear={reset} />}
              </div>
            </div>

            <div className="border-border border-t px-6 py-4">
              <AppButton
                variant="primary"
                size="lg"
                className="w-full"
                loading={isPending}
                disabled={isPending}
                onClick={() => mutate(buildAIPayload(decision))}
              >
                {isPending ? "Analyzing..." : "Run AI Analysis"}
              </AppButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DecisionSidePanel;
