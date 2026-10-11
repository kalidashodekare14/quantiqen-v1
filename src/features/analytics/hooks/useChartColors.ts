"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";

export interface ChartColors {
  series: [string, string, string, string, string];
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  text: string;
}

const FALLBACK_COLORS: ChartColors = {
  series: ["#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"],
  grid: "#e5e7eb",
  axis: "#6b7280",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e5e7eb",
  text: "#111827",
};

function readChartColors(): ChartColors {
  if (typeof document === "undefined") {
    return FALLBACK_COLORS;
  }

  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string): string =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    series: [
      read("--chart-1", FALLBACK_COLORS.series[0]),
      read("--chart-2", FALLBACK_COLORS.series[1]),
      read("--chart-3", FALLBACK_COLORS.series[2]),
      read("--chart-4", FALLBACK_COLORS.series[3]),
      read("--chart-5", FALLBACK_COLORS.series[4]),
    ],
    grid: read("--border", FALLBACK_COLORS.grid),
    axis: read("--muted-foreground", FALLBACK_COLORS.axis),
    tooltipBg: read("--card", FALLBACK_COLORS.tooltipBg),
    tooltipBorder: read("--border", FALLBACK_COLORS.tooltipBorder),
    text: read("--foreground", FALLBACK_COLORS.text),
  };
}

export const useChartColors = (): ChartColors => {
  useTheme();

  return readChartColors();
};

export const tooltipContentStyle = (colors: ChartColors): CSSProperties => ({
  backgroundColor: colors.tooltipBg,
  border: `1px solid ${colors.tooltipBorder}`,
  borderRadius: "8px",
  fontSize: "12px",
  color: colors.text,
});
