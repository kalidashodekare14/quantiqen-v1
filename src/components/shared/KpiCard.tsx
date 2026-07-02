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
import { fadeInScale } from "@/lib/motion";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            {...fadeInScale}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-card/80 backdrop-blur-md border border-foreground/10 flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
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
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${
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
              <p className="text-muted-foreground mt-0.5 text-sm lg:text-base">{card.label}</p>
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

            <p className="text-muted-foreground text-xs lg:text-sm">
              Last updated: {formatDateTime(card.lastUpdated)}
            </p>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-card ring-foreground/10 max-w-50 rounded-xl p-3 text-sm ring-1"
        >
          <div className="flex flex-col gap-1">
            <p className="text-card-foreground font-semibold">{card.label}</p>
            <p className="text-muted-foreground">
              Value: {card.value}
              {card.unit === "percent" ? "%" : ""}
            </p>
            {card.percentageChange !== null && (
              <p className="text-muted-foreground">
                Change: {card.percentageChange > 0 ? "+" : ""}
                {card.percentageChange}%{" "}
                {card.trend === "up" ? "↑" : card.trend === "down" ? "↓" : ""}
              </p>
            )}
            <div className="border-foreground/10 my-1 border-t" />
            <p className="text-muted-foreground text-xs">
              Updated: {formatDateTime(card.lastUpdated)}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default KpiCard;
