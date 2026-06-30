"use client";

import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import AppButton from "@/components/shared/AppButton";
import type { Recommendation } from "@/types/recommendation.types";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const severityStyles: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-chart-3/10 text-chart-3",
  Medium: "bg-chart-5/10 text-chart-5",
  Low: "bg-muted text-muted-foreground",
};

const statusStyles: Record<string, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  "In Progress": "bg-chart-5/10 text-chart-5",
};

const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-card ring-foreground/10 flex flex-col gap-4 rounded-xl p-4 ring-1"
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

      <AppButton variant="chart" size="lg" fullWidth>
        Take Action
      </AppButton>
    </motion.div>
  );
};

export default RecommendationCard;
