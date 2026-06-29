import { Activity, AlertTriangle, BrainCircuit, Shield } from "lucide-react";

import { StatCard } from "@/components/common/stat-card";

const STATS = [
  {
    title: "Total Assets",
    value: "12,847",
    icon: <Shield className="size-5 text-muted-foreground" />,
    trend: { value: "8.2%", direction: "up" as const },
  },
  {
    title: "Active APIs",
    value: "347",
    icon: <Activity className="size-5 text-muted-foreground" />,
    trend: { value: "12.5%", direction: "up" as const },
  },
  {
    title: "Security Incidents",
    value: "23",
    icon: <AlertTriangle className="size-5 text-muted-foreground" />,
    trend: { value: "17.3%", direction: "down" as const },
  },
  {
    title: "AI Decisions",
    value: "89,201",
    icon: <BrainCircuit className="size-5 text-muted-foreground" />,
    trend: { value: "24.1%", direction: "up" as const },
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
