"use client";

import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import AppButton from "@/components/shared/AppButton";
import type { Recommendation } from "@/types/recommendation.types";
import type { AIDecisionRequest } from "@/types/ai-engine.types";
import { severityStyles } from "@/constants/severity";
import { fadeInScale } from "@/lib/motion";
import { useAIDecision } from "@/features/decisions/hooks/useAIDecision";

const AIAnalysisModal = dynamic(
  () => import("@/features/ai-recommendations/components/AIAnalysisModal"),
  { ssr: false }
);

interface RecommendationCardProps {
  recommendation: Recommendation;
}

type RecommendationStatus = "Pending" | "In Progress";

const statusStyles: Record<RecommendationStatus, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  "In Progress": "bg-chart-5/10 text-chart-5",
};

const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  const { mutate, isPending, isError, data: aiResult, reset } = useAIDecision();
  const modalOpen = !!aiResult || isError;

  const buildAIPayload = useCallback((rec: Recommendation): AIDecisionRequest => ({
    organization: "Acme Corp",
    findings: [{
      finding_id: rec.id,
      title: rec.recommendation,
      description: rec.recommendation,
      severity: rec.priority.toLowerCase() as "low" | "medium" | "high" | "critical",
      category: "recommendation",
      affected_asset: "unknown",
      asset_type: "unknown",
    }]
  }), []);

  const payload = useMemo(() => buildAIPayload(recommendation), [buildAIPayload, recommendation]);

  const handleRetry = () => {
    reset();
    mutate(payload);
  };

  return (
    <>
      <motion.div
        {...fadeInScale}
        className="bg-card/80 backdrop-blur-md border border-foreground/10 flex flex-col gap-4 rounded-xl p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
      >
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs lg:text-sm">{recommendation.id}</span>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${
              statusStyles[recommendation.status]
            }`}
          >
            {recommendation.status}
          </span>
        </div>

        <p className="text-card-foreground text-sm leading-snug font-semibold lg:text-base">
          {recommendation.recommendation}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${
              severityStyles[recommendation.businessImpact]
            }`}
          >
            {recommendation.businessImpact}
          </span>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${
              severityStyles[recommendation.priority]
            }`}
          >
            {recommendation.priority}
          </span>
          <span className="text-card-foreground text-xs lg:text-sm">
            {recommendation.confidence}%
          </span>
        </div>

        <div className="space-y-1.5 text-xs lg:text-sm">
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5" />
            <span>{recommendation.estimatedFixTime}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Users className="size-3.5" />
            <span>{recommendation.responsibleTeam}</span>
          </div>
        </div>

        <AppButton
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          disabled={isPending}
          onClick={() => mutate(payload)}
        >
          {isPending ? "Analyzing..." : "Run AI Analysis"}
        </AppButton>
      </motion.div>

      <AIAnalysisModal
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) reset();
        }}
        result={aiResult}
        isError={isError}
        isPending={isPending}
        onRetry={handleRetry}
      />
    </>
  );
};

export default RecommendationCard;
