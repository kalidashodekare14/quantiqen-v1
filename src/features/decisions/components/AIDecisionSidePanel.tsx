"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";
import type { AIDecisionItem } from "@/types/ai-engine.types";
import { severityStyles } from "@/constants/severity";

interface AIDecisionSidePanelProps {
  decision: AIDecisionItem;
  onClose: () => void;
}

function getScoreColor(score: number): string {
  if (score > 80) return "text-destructive";
  if (score >= 60) return "text-chart-3";
  return "text-chart-2";
}

function getScoreBg(score: number): string {
  if (score > 80) return "bg-destructive";
  if (score >= 60) return "bg-chart-3";
  return "bg-chart-2";
}

function getConfidenceColor(score: number): string {
  if (score > 80) return "text-chart-2";
  if (score >= 60) return "text-chart-3";
  return "text-destructive";
}

function getConfidenceBg(score: number): string {
  if (score > 80) return "bg-chart-2";
  if (score >= 60) return "bg-chart-3";
  return "bg-destructive";
}

const AIDecisionSidePanel = ({ decision, onClose }: AIDecisionSidePanelProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const confidencePct =
    decision.confidence_score !== undefined
      ? Math.round(decision.confidence_score * 100)
      : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-40 bg-black"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-card fixed inset-y-0 right-0 z-50 flex w-full flex-col sm:w-105"
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-sm truncate font-mono">
              {decision.finding_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Score + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-xl p-4">
              <p className="text-muted-foreground text-xs font-medium mb-1">Risk Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(decision.risk_score)}`}>
                {decision.risk_score}
              </p>
              <div className="bg-muted-foreground/20 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full ${getScoreBg(decision.risk_score)}`}
                  style={{ width: `${decision.risk_score}%` }}
                />
              </div>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <p className="text-muted-foreground text-xs font-medium mb-1">Priority</p>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                  severityStyles[decision.priority]
                }`}
              >
                {decision.priority}
              </span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
            <p className="text-foreground text-xs font-medium tracking-wider uppercase mb-2">
              Recommended Action
            </p>
            <p className="text-card-foreground text-sm leading-relaxed">
              {decision.recommendation}
            </p>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 text-card-foreground text-sm">
            <Clock className="text-muted-foreground size-4 shrink-0" />
            <span>{decision.timeline}</span>
          </div>

          <hr className="border-border" />

          {/* Justification */}
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase mb-2">
              Justification
            </p>
            <p className="text-card-foreground text-sm leading-relaxed">
              {decision.justification ?? "No justification provided."}
            </p>
          </div>

          <hr className="border-border" />

          {/* Business Impact */}
          {decision.business_impact && (
            <>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase mb-2">
                  Business Impact
                </p>
                <p className="text-card-foreground text-sm leading-relaxed">
                  {decision.business_impact}
                </p>
              </div>
              <hr className="border-border" />
            </>
          )}

          {/* Technical Impact */}
          {decision.technical_impact && (
            <>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase mb-2">
                  Technical Impact
                </p>
                <p className="text-card-foreground text-sm leading-relaxed">
                  {decision.technical_impact}
                </p>
              </div>
              <hr className="border-border" />
            </>
          )}

          {/* Confidence Score */}
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase mb-2">
              Confidence
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`text-lg font-semibold ${getConfidenceColor(confidencePct)}`}
              >
                {confidencePct}%
              </span>
              <div className="bg-muted-foreground/20 flex-1 h-2 overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full ${getConfidenceBg(confidencePct)}`}
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Risk Factors */}
          {decision.risk_factors && decision.risk_factors.length > 0 && (
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase mb-2">
                Risk Factors
              </p>
              <div className="flex flex-wrap gap-1.5">
                {decision.risk_factors.map((factor) => (
                  <span
                    key={factor}
                    className="bg-muted text-muted-foreground inline-block rounded-full px-2.5 py-0.5 text-xs"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIDecisionSidePanel;
