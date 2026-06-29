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
import type { SecurityScorePoint } from "@/types/analytics.types";

interface SecurityScoreChartProps {
  data: SecurityScorePoint[];
}

const SecurityScoreChart = ({ data }: SecurityScoreChartProps) => {
  return (
    <div className="w-full rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">
          Security Score Timeline
        </h3>
        <p className="text-xs text-muted-foreground">Last 14 days</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#4a5568" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#4a5568" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#141820",
              border: "1px solid #2d3748",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            name="Security Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SecurityScoreChart;
