"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import ChartPanel from "./ChartPanel";
import { tooltipContentStyle, useChartColors } from "../hooks/useChartColors";
import type { RiskTrendPoint, SectionResult } from "@/types/analytics.types";

interface RiskTrendChartProps {
  section: SectionResult<RiskTrendPoint[]>;
  subtitle?: string;
  onRetry?: () => void;
}

const RiskTrendChart = ({ section, subtitle, onRetry }: RiskTrendChartProps) => {
  const colors = useChartColors();
  const data = section.status === "ok" ? section.data : [];

  return (
    <ChartPanel
      title="Risk Trend"
      subtitle={subtitle}
      status={section.status}
      isEmpty={data.length === 0}
      onRetry={onRetry}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: colors.axis }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: colors.axis }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: colors.axis }} />
          <Tooltip contentStyle={tooltipContentStyle(colors)} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="riskScore"
            stroke={colors.series[3]}
            strokeWidth={2}
            dot={false}
            name="Avg Risk Score"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="threats"
            stroke={colors.series[2]}
            strokeWidth={2}
            dot={false}
            name="Total Risks"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
};

export default RiskTrendChart;
