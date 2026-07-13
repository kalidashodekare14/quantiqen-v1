"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Finding } from "@/types/finding.types";
import AppButton from "@/components/shared/AppButton";

interface FindingSidePanelProps {
  finding: Finding;
  isAnalyzed: boolean;
  isPending: boolean;
  isHealthError: boolean;
  onAnalyze: () => void;
  onClose: () => void;
}

const findingSeverityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-chart-3/10 text-chart-3",
  medium: "bg-chart-5/10 text-chart-5",
  low: "bg-muted text-muted-foreground",
};

const FindingSidePanel = ({
  finding,
  isAnalyzed,
  isPending,
  isHealthError,
  onAnalyze,
  onClose,
}: FindingSidePanelProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
            <p className="text-card-foreground truncate text-lg font-semibold">{finding.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium lg:text-sm ${
                findingSeverityStyles[finding.severity]
              }`}
            >
              {finding.severity}
            </span>
            {isAnalyzed ? (
              <span className="bg-chart-2/10 text-chart-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
                Analyzed ✓
              </span>
            ) : (
              <span className="bg-chart-3/10 text-chart-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
                Pending Analysis
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Asset
              </p>
              <p className="text-card-foreground text-sm">{finding.affected_asset}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Asset Type
              </p>
              <p className="text-card-foreground text-sm">{finding.asset_type}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Category
              </p>
              <p className="text-card-foreground text-sm">{finding.category}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Owner
              </p>
              <p className="text-card-foreground text-sm">{finding.owner}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Organization
              </p>
              <p className="text-card-foreground text-sm">{finding.organization}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Description
              </p>
              <p className="text-card-foreground text-sm leading-relaxed">{finding.description}</p>
            </div>
          </div>
        </div>

        <div className="border-border border-t px-6 py-4">
          {isAnalyzed ? (
            <div className="flex flex-col gap-3">
              <div className="bg-chart-2/10 border-chart-2/20 text-chart-2 rounded-xl border p-3 text-sm">
                ✓ This finding has been analyzed. View results in the Analyzed tab.
              </div>
              <AppButton variant="outline" size="lg" fullWidth onClick={onClose}>
                View AI Decision
              </AppButton>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <AppButton
                variant="primary"
                size="lg"
                fullWidth
                disabled={isPending || isHealthError}
                loading={isPending}
                onClick={onAnalyze}
              >
                {isPending ? "Analyzing..." : "Run AI Analysis"}
              </AppButton>
              <p className="text-muted-foreground text-center text-xs">
                AI will analyze this finding and generate a risk decision.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FindingSidePanel;
