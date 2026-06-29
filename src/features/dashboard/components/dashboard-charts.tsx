"use client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SectionCard } from "@/components/common/section-card";

const RISK_DATA = [
  { day: "Mon", incidents: 12 },
  { day: "Tue", incidents: 8 },
  { day: "Wed", incidents: 15 },
  { day: "Thu", incidents: 6 },
  { day: "Fri", incidents: 10 },
  { day: "Sat", incidents: 4 },
  { day: "Sun", incidents: 7 },
];

const API_DATA = [
  { day: "Mon", requests: 2400 },
  { day: "Tue", requests: 1398 },
  { day: "Wed", requests: 3800 },
  { day: "Thu", requests: 2908 },
  { day: "Fri", requests: 4800 },
  { day: "Sat", requests: 3800 },
  { day: "Sun", requests: 4300 },
];

export function DashboardCharts() {
  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Risk Trend" description="Risk incidents over the last 7 days.">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={RISK_DATA}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="day"
                className="text-muted-foreground text-xs"
                tickLine={false}
                axisLine={false}
              />
              <YAxis className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="incidents"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#riskGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <SectionCard title="API Usage" description="Daily API requests.">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={API_DATA}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="day"
                className="text-muted-foreground text-xs"
                tickLine={false}
                axisLine={false}
              />
              <YAxis className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "13px",
                }}
              />
              <Bar
                dataKey="requests"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
}
