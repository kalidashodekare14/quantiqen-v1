"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import ChartPanel from "./ChartPanel";
import { tooltipContentStyle, useChartColors } from "../hooks/useChartColors";
import type { SecurityScorePoint, SectionResult } from "@/types/analytics.types";

interface SecurityScoreChartProps {
  section: SectionResult<SecurityScorePoint[]>;
  subtitle?: string;
  onRetry?: () => void;
}

const SecurityScoreChart = ({ section, subtitle, onRetry }: SecurityScoreChartProps) => {
  const colors = useChartColors();
  const data = section.status === "ok" ? section.data : [];
  const scoreColor = colors.series[1];

  return (
    <ChartPanel
      title="Security Score Timeline"
      subtitle={subtitle}
      status={section.status}
      isEmpty={data.length === 0}
      onRetry={onRetry}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={scoreColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={scoreColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: colors.axis }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: colors.axis }} />
          <Tooltip contentStyle={tooltipContentStyle(colors)} />
          <Line
            type="monotone"
            dataKey="score"
            stroke={scoreColor}
            strokeWidth={2}
            dot={false}
            name="Security Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
};

export default SecurityScoreChart;
