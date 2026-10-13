"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import ChartPanel from "./ChartPanel";
import { tooltipContentStyle, useChartColors } from "../hooks/useChartColors";
import type { DecisionTrendPoint, SectionResult } from "@/types/analytics.types";

interface DecisionTrendChartProps {
  section: SectionResult<DecisionTrendPoint[]>;
  subtitle?: string;
  onRetry?: () => void;
}

const DecisionTrendChart = ({ section, subtitle, onRetry }: DecisionTrendChartProps) => {
  const colors = useChartColors();
  const data = section.status === "ok" ? section.data : [];
  const [decisionsColor, resolvedColor, openColor] = [
    colors.series[4],
    colors.series[1],
    colors.series[2],
  ];

  return (
    <ChartPanel
      title="Decision Trend"
      subtitle={subtitle}
      status={section.status}
      isEmpty={data.length === 0}
      onRetry={onRetry}
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="decisionsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={decisionsColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={decisionsColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={resolvedColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={resolvedColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={openColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={openColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: colors.axis }} />
          <YAxis tick={{ fontSize: 11, fill: colors.axis }} />
          <Tooltip contentStyle={tooltipContentStyle(colors)} />
          <Legend />
          <Area
            type="monotone"
            dataKey="decisions"
            stroke={decisionsColor}
            strokeWidth={2}
            fill="url(#decisionsGrad)"
            name="Decisions"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stroke={resolvedColor}
            strokeWidth={2}
            fill="url(#resolvedGrad)"
            name="Resolved"
          />
          <Area
            type="monotone"
            dataKey="open"
            stroke={openColor}
            strokeWidth={2}
            fill="url(#openGrad)"
            name="Open"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
};

export default DecisionTrendChart;
