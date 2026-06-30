"use client";

import { Zap, Server, Brain, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";
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
          value: stats.assetsUpdated.toLocaleString(),
          label: "Assets Updated",
          icon: Server,
        },
        {
          value: stats.decisionsCreated.toLocaleString(),
          label: "Decisions Created",
          icon: Brain,
        },
        {
          value: stats.risksChanged.toLocaleString(),
          label: "Risks Changed",
          color: "warning",
          icon: AlertTriangle,
        },
        {
          value: stats.securityEvents.toLocaleString(),
          label: "Security Events",
          color: "danger",
          icon: ShieldAlert,
        },
        {
          value: stats.decisionsDelivered.toLocaleString(),
          label: "Decisions Delivered",
          color: "success",
          icon: CheckCircle,
        },
      ]}
    />
  );
};

export default MonitoringStats;
