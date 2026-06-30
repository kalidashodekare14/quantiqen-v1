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
import type { DecisionTrendPoint } from "@/types/analytics.types";

interface DecisionTrendChartProps {
  data: DecisionTrendPoint[];
}

const DecisionTrendChart = ({ data }: DecisionTrendChartProps) => {
  return (
    <div className="w-full rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="mb-4">
        <h3 className="text-sm lg:text-base font-semibold text-card-foreground">
          Decision Trend
        </h3>
        <p className="text-xs lg:text-sm text-muted-foreground">Last 14 days</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="decisionsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="decisions"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#decisionsGrad)"
            name="Decisions"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#resolvedGrad)"
            name="Resolved"
          />
          <Area
            type="monotone"
            dataKey="pending"
            stroke="#fbbf24"
            strokeWidth={2}
            fill="url(#pendingGrad)"
            name="Pending"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DecisionTrendChart;
