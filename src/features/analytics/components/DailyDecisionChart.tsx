"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "@/components/shared/ChartCard";
import type { DailyDecisionPoint } from "@/types/analytics.types";

interface DailyDecisionChartProps {
  data: DailyDecisionPoint[];
}

const DailyDecisionChart = ({ data }: DailyDecisionChartProps) => {
  return (
    <ChartCard title="Daily Decision Count" subtitle="This week">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
          <XAxis
            dataKey="day"
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
          <Bar
            dataKey="count"
            fill="#a78bfa"
            radius={[4, 4, 0, 0]}
            name="Decisions"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default DailyDecisionChart;
