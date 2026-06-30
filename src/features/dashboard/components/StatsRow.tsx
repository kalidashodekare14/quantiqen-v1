"use client";

import { Server, Zap, Activity, AlertTriangle, Clock } from "lucide-react";
import { StatPills } from "@/components/shared/StatPills";
import type { SecuritySummary } from "@/types/dashboard.types";

interface StatsRowProps {
  summary: SecuritySummary;
}

const StatsRow = ({ summary }: StatsRowProps) => {
  return (
    <div className="my-5">
      <StatPills
        stats={[
          {
            value: summary.totalAssets.toLocaleString(),
            label: "Total Assets",
            color: "success",
            icon: Server,
          },
          {
            value: summary.activeAPIs,
            label: "Active APIs",
            icon: Zap,
          },
          {
            value: summary.apiRequestsToday.toLocaleString(),
            label: "API Requests Today",
            icon: Activity,
          },
          {
            value: summary.activeRisks,
            label: "Active Risks",
            color: "warning",
            icon: AlertTriangle,
          },
          {
            value: summary.pendingDecisions,
            label: "Pending Decisions",
            color: "danger",
            icon: Clock,
          },
        ]}
      />
    </div>
  );
};

export default StatsRow;
