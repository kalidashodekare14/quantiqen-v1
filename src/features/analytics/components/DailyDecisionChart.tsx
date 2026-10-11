"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import ChartPanel from "./ChartPanel";
import { tooltipContentStyle, useChartColors } from "../hooks/useChartColors";
import type { DailyDecisionPoint, SectionResult } from "@/types/analytics.types";

interface DailyDecisionChartProps {
  section: SectionResult<DailyDecisionPoint[]>;
  subtitle?: string;
  onRetry?: () => void;
}

const DailyDecisionChart = ({ section, subtitle, onRetry }: DailyDecisionChartProps) => {
  const colors = useChartColors();
  const data = section.status === "ok" ? section.data : [];

  return (
    <ChartPanel
      title="Daily Decision Count"
      subtitle={subtitle}
      status={section.status}
      isEmpty={data.length === 0}
      onRetry={onRetry}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: colors.axis }} />
          <YAxis tick={{ fontSize: 11, fill: colors.axis }} />
          <Tooltip contentStyle={tooltipContentStyle(colors)} />
          <Bar dataKey="count" fill={colors.series[0]} radius={[4, 4, 0, 0]} name="Decisions" />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
};

export default DailyDecisionChart;
