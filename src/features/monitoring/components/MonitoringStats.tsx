"use client";

import { motion } from "framer-motion";
import { Zap, Server, Brain, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";
import type { MonitoringStats as MonitoringStatsType } from "@/types/monitoring.types";

interface MonitoringStatsProps {
  stats: MonitoringStatsType;
}

interface StatCard {
  label: string;
  getValue: (stats: MonitoringStatsType) => number;
  icon: typeof Zap;
  iconColor: string;
  valueColor: string;
}

const cards: StatCard[] = [
  {
    label: "API Requests",
    getValue: (s) => s.apiRequests,
    icon: Zap,
    iconColor: "text-chart-5",
    valueColor: "text-card-foreground",
  },
  {
    label: "Assets Updated",
    getValue: (s) => s.assetsUpdated,
    icon: Server,
    iconColor: "text-chart-5",
    valueColor: "text-card-foreground",
  },
  {
    label: "Decisions Created",
    getValue: (s) => s.decisionsCreated,
    icon: Brain,
    iconColor: "text-chart-5",
    valueColor: "text-card-foreground",
  },
  {
    label: "Risks Changed",
    getValue: (s) => s.risksChanged,
    icon: AlertTriangle,
    iconColor: "text-chart-3",
    valueColor: "text-chart-3",
  },
  {
    label: "Security Events",
    getValue: (s) => s.securityEvents,
    icon: ShieldAlert,
    iconColor: "text-destructive",
    valueColor: "text-destructive",
  },
  {
    label: "Decisions Delivered",
    getValue: (s) => s.decisionsDelivered,
    icon: CheckCircle,
    iconColor: "text-chart-2",
    valueColor: "text-chart-2",
  },
];

const MonitoringStats = ({ stats }: MonitoringStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07 }}
            className="rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10"
          >
            <div className="flex items-center gap-1.5">
              <IconComponent className={`size-4 ${card.iconColor}`} />
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className={`mt-2 text-2xl font-bold ${card.valueColor}`}>
              {card.getValue(stats).toLocaleString()}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MonitoringStats;
