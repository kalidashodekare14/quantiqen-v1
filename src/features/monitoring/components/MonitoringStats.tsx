"use client";

import { Zap, Server, Brain, AlertTriangle, ShieldAlert, Activity } from "lucide-react";
import { StatPills } from "@/components/shared/StatPills";
import type { MonitoringStats as MonitoringStatsType } from "@/types/monitoring.types";

interface MonitoringStatsProps {
  stats: MonitoringStatsType;
}

const MonitoringStats = ({ stats }: MonitoringStatsProps) => {
  return (
    <StatPills
      stats={[
        {
          value: stats.apiRequests.toLocaleString(),
          label: "API Requests",
          icon: Zap,
        },
        {
          value: stats.assets.toLocaleString(),
          label: "Total Assets",
          icon: Server,
        },
        {
          value: stats.decisions.toLocaleString(),
          label: "Decisions",
          icon: Brain,
        },
        {
          value: stats.risks.toLocaleString(),
          label: "Active Risks",
          color: "warning",
          icon: AlertTriangle,
        },
        {
          value: stats.events.toLocaleString(),
          label: "Events",
          icon: Activity,
        },
        {
          value: stats.findings.toLocaleString(),
          label: "Findings",
          color: "danger",
          icon: ShieldAlert,
        },
      ]}
    />
  );
};

export default MonitoringStats;
