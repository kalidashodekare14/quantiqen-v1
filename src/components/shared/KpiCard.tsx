"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import {
  Shield,
  TrendingUp,
  Server,
  AlertTriangle,
  Brain,
  Globe,
  HeartPulse,
  Activity,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { KpiCard as KpiCardType } from "@/types/dashboard.types";
import { formatDateTime } from "@/utils/date/date";

interface KpiCardProps {
  card: KpiCardType;
}

const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  "trending-up": TrendingUp,
  server: Server,
  "alert-triangle": AlertTriangle,
  brain: Brain,
  api: Globe,
  "heart-rate-monitor": HeartPulse,
  activity: Activity,
};

const colorMap: Record<string, string> = {
  blue: "var(--color-chart-5)",
  amber: "var(--color-chart-3)",
  green: "var(--color-chart-2)",
  red: "var(--color-chart-4)",
  purple: "var(--color-chart-1)",
  teal: "var(--color-chart-2)",
  pink: "var(--color-chart-1)",
  gray: "var(--color-muted-foreground)",
};

function getColorVar(colorName: string): string {
  return colorMap[colorName] ?? "var(--color-chart-5)";
}

function formatPercentage(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

const KpiCard = ({ card }: KpiCardProps) => {
  const IconComponent = iconMap[card.icon];
  const colorVar = getColorVar(card.color);
  const maxSparkValue = Math.max(...card.sparkline, 1);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setDisplayValue(0);
    const controls = animate(0, card.value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return controls.stop;
  }, [card.value]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="bg-card ring-foreground/10 hover:ring-foreground/20 flex flex-col gap-3 rounded-xl p-4 ring-1 transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div
          className="flex size-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `color-mix(in srgb, ${colorVar} 10%, transparent)` }}
        >
          {IconComponent && <IconComponent className="size-5" style={{ color: colorVar }} />}
        </div>

        {card.percentageChange !== null && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              card.trend === "up"
                ? "bg-chart-2/10 text-chart-2"
                : card.trend === "down"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {card.trend === "up" && <ArrowUp className="size-3" />}
            {card.trend === "down" && <ArrowDown className="size-3" />}
            {formatPercentage(card.percentageChange)}
          </div>
        )}
      </div>

      <div>
        <p className="text-card-foreground text-2xl font-semibold">
          {displayValue}
          {card.unit === "percent" && "%"}
        </p>
        <p className="text-muted-foreground mt-0.5 text-sm">{card.label}</p>
      </div>

      <div className="flex items-end gap-0.75" style={{ height: 32 }}>
        {card.sparkline.map((value, index) => {
          const heightPercent = (value / maxSparkValue) * 100;
          return (
            <div
              key={index}
              className="flex-1 rounded-sm"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: colorVar,
              }}
            />
          );
        })}
      </div>

      <p className="text-muted-foreground text-[11px]">
        Last updated: {formatDateTime(card.lastUpdated)}
      </p>
    </motion.div>
  );
};

export default KpiCard;
