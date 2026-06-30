"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";

type PillColor = "default" | "success" | "warning" | "danger";

interface Stat {
  label: string;
  value: number | string;
  color?: PillColor;
  icon?: ElementType;
}

interface StatPillsProps {
  stats: Stat[];
}

const colorMap: Record<PillColor, string> = {
  default: "text-card-foreground",
  success: "text-chart-2",
  warning: "text-chart-3",
  danger: "text-destructive",
};

const iconColorMap: Record<PillColor, string> = {
  default: "text-chart-5",
  success: "text-chart-2",
  warning: "text-chart-3",
  danger: "text-destructive",
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
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

export const StatPills = ({ stats }: StatPillsProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        const pillColor = stat.color ?? "default";

        return (
          <motion.div
            key={stat.label}
            variants={pillVariants}
            className="bg-card ring-foreground/10 rounded-xl px-4 py-3 ring-1"
          >
            <div className="flex items-center gap-1.5">
              {Icon && <Icon className={`size-5 ${iconColorMap[pillColor]}`} />}
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </div>
            <p className={`text-2xl font-medium ${colorMap[pillColor]} ${Icon ? "mt-2" : ""}`}>
              {stat.value}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
