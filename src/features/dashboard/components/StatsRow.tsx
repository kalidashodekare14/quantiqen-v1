"use client";

import { motion } from "framer-motion";
import type { SecuritySummary } from "@/types/dashboard.types";

interface StatsRowProps {
  summary: SecuritySummary;
}

interface Stat {
  value: number | string;
  label: string;
  valueClass: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const pillVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const StatsRow = ({ summary }: StatsRowProps) => {
  const stats: Stat[] = [
    {
      value: summary.totalAssets.toLocaleString(),
      label: "Total Assets",
      valueClass: "text-chart-2",
    },
    {
      value: summary.activeAPIs,
      label: "Active APIs",
      valueClass: "text-card-foreground",
    },
    {
      value: summary.apiRequestsToday.toLocaleString(),
      label: "API Requests Today",
      valueClass: "text-card-foreground",
    },
    {
      value: summary.activeRisks,
      label: "Active Risks",
      valueClass: "text-chart-3",
    },
    {
      value: summary.pendingDecisions,
      label: "Pending Decisions",
      valueClass: "text-destructive",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={pillVariants}
          className="bg-card ring-foreground/10 rounded-2xl px-4 py-3 ring-1"
        >
          <p className={`text-lg font-medium ${stat.valueClass}`}>{stat.value}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsRow;
