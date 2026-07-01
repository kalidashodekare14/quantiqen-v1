"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Decision } from "@/types/decision.types";
import { severityStyles } from "@/constants/severity";

interface DecisionSidePanelProps {
  decision: Decision | null;
  onClose: () => void;
}
// TODO: Letter
const statusStyles: Record<string, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  "In Review": "bg-chart-5/10 text-chart-5",
  Resolved: "bg-chart-2/10 text-chart-2",
};

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

const DecisionSidePanel = ({ decision, onClose }: DecisionSidePanelProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (decision) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [decision, onClose]);

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
              <div className="min-w-0">
                <p className="text-chart-5 truncate text-lg font-semibold">{decision.id}</p>
                <p className="text-muted-foreground mt-0.5 truncate text-sm">
                  {decision.organization}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium lg:text-sm ${
                    statusStyles[decision.status]
                  }`}
                >
                  {decision.status}
                </span>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium lg:text-sm ${
                    severityStyles[decision.priority]
                  }`}
                >
                  {decision.priority}
                </span>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium lg:text-sm ${
                    severityStyles[decision.businessImpact]
                  }`}
                >
                  {decision.businessImpact}
                </span>
              </div>

              <hr className="border-border my-5" />

              <div>
                <p className="text-muted-foreground mb-1.5 text-sm font-medium tracking-wider uppercase lg:text-base">
                  Risk
                </p>
                <p className="text-card-foreground text-sm font-medium lg:text-base">
                  {decision.risk}
                </p>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed lg:text-base">
                  {decision.details.description}
                </p>
              </div>

              <hr className="border-border my-5" />

              <div>
                <p className="text-muted-foreground mb-1.5 text-sm font-medium tracking-wider uppercase lg:text-base">
                  Affected Asset
                </p>
                <p className="text-card-foreground text-sm font-medium lg:text-base">
                  {decision.asset}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {decision.details.affectedAssets.map((asset) => (
                    <span
                      key={asset}
                      className="bg-muted text-muted-foreground inline-block rounded-md px-2 py-1 text-xs lg:text-sm"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>

              <hr className="border-border my-5" />

              <div>
                <p className="text-muted-foreground mb-3 text-sm font-medium tracking-wider uppercase lg:text-base">
                  Scores
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs lg:text-sm">Risk Score</p>
                    <p
                      className={`mt-1 text-xl font-semibold ${getScoreTextColor(decision.details.riskScore)}`}
                    >
                      {decision.details.riskScore}
                    </p>
                    <div className="bg-muted-foreground/20 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${getScoreBgColor(decision.details.riskScore)}`}
                        style={{
                          width: `${decision.details.riskScore}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs lg:text-sm">CVSS Score</p>
                    <p
                      className={`mt-1 text-xl font-semibold ${getScoreTextColor(decision.details.cvss * 10)}`}
                    >
                      {decision.details.cvss}
                    </p>
                    <div className="bg-muted-foreground/20 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${getScoreBgColor(decision.details.cvss * 10)}`}
                        style={{
                          width: `${(decision.details.cvss / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-muted mt-3 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs lg:text-sm">Confidence</p>
                  <p className="text-chart-2 mt-1 text-xl font-semibold">{decision.confidence}%</p>
                  <div className="bg-muted-foreground/20 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-chart-2 h-full rounded-full"
                      style={{ width: `${decision.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              <hr className="border-border my-5" />

              <div>
                <p className="text-muted-foreground mb-1.5 text-sm font-medium tracking-wider uppercase lg:text-base">
                  Recommended Action
                </p>
                <p className="text-card-foreground text-sm leading-relaxed lg:text-base">
                  {decision.details.recommendedAction}
                </p>
              </div>

              <hr className="border-border my-5" />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs lg:text-sm">Fix Time</p>
                  <p className="text-card-foreground mt-0.5 text-sm font-medium lg:text-base">
                    {decision.details.estimatedFixTime}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs lg:text-sm">Owner</p>
                  <p className="text-card-foreground mt-0.5 text-sm font-medium lg:text-base">
                    {decision.owner}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs lg:text-sm">Team</p>
                  <p className="text-card-foreground mt-0.5 text-sm font-medium lg:text-base">
                    {decision.details.responsibleTeam}
                  </p>
                </div>
              </div>

              <hr className="border-border my-5" />

              <div>
                <p className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase lg:text-base">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {decision.details.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground inline-block rounded-full px-2.5 py-0.5 text-xs lg:text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-border border-t px-6 py-4">
              <Button className="w-full" size="lg">
                Take Action
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DecisionSidePanel;
