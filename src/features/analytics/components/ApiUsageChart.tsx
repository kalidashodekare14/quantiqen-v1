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
import ChartCard from "@/components/shared/ChartCard";
import type { ApiUsagePoint } from "@/types/analytics.types";

interface ApiUsageChartProps {
  data: ApiUsagePoint[];
}

const ApiUsageChart = ({ data }: ApiUsageChartProps) => {
  return (
    <ChartCard title="API Usage" subtitle="Last 14 days">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={12}>
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
          <Bar
            dataKey="requests"
            fill="#60a5fa"
            radius={[4, 4, 0, 0]}
            name="Requests"
          />
          <Bar
            dataKey="errors"
            fill="#f87171"
            radius={[4, 4, 0, 0]}
            name="Errors"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ApiUsageChart;
