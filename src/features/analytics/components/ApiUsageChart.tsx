"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import ChartPanel from "./ChartPanel";
import { tooltipContentStyle, useChartColors } from "../hooks/useChartColors";
import type { ApiUsagePoint, SectionResult } from "@/types/analytics.types";

interface ApiUsageChartProps {
  section: SectionResult<ApiUsagePoint[]>;
  subtitle?: string;
  onRetry?: () => void;
}

const ApiUsageChart = ({ section, subtitle, onRetry }: ApiUsageChartProps) => {
  const colors = useChartColors();
  const data = section.status === "ok" ? section.data : [];

  return (
    <ChartPanel
      title="API Usage"
      subtitle={subtitle}
      status={section.status}
      isEmpty={data.length === 0}
      onRetry={onRetry}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={12}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: colors.axis }} />
          <YAxis tick={{ fontSize: 11, fill: colors.axis }} />
          <Tooltip contentStyle={tooltipContentStyle(colors)} />
          <Legend />
          <Bar dataKey="requests" fill={colors.series[4]} radius={[4, 4, 0, 0]} name="Requests" />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
};

export default ApiUsageChart;
