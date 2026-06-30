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
import ChartCard from "@/components/shared/ChartCard";
import type { RiskTrendPoint } from "@/types/analytics.types";

interface RiskTrendChartProps {
  data: RiskTrendPoint[];
}

const RiskTrendChart = ({ data }: RiskTrendChartProps) => {
  return (
    <ChartCard title="Risk Trend" subtitle="Last 14 days">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#4a5568" }}
          />
          <YAxis tick={{ fontSize: 11, fill: "#4a5568" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#141820",
              border: "1px solid #2d3748",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="riskScore"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
            name="Risk Score"
          />
          <Line
            type="monotone"
            dataKey="threats"
            stroke="#fb923c"
            strokeWidth={2}
            dot={false}
            name="Threats"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default RiskTrendChart;
