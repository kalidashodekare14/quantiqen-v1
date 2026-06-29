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
import type { DailyDecisionPoint } from "@/types/analytics.types";

interface DailyDecisionChartProps {
  data: DailyDecisionPoint[];
}

const DailyDecisionChart = ({ data }: DailyDecisionChartProps) => {
  return (
    <div className="w-full rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">
          Daily Decision Count
        </h3>
        <p className="text-xs text-muted-foreground">This week</p>
      </div>

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
    </div>
  );
};

export default DailyDecisionChart;
