import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { SectionCard } from "@/components/common/section-card";

interface StatCardTrend {
  value: string;
  direction: "up" | "down" | "neutral";
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: StatCardTrend;
  description?: string;
  className?: string;
}

export function StatCard({ title, value, icon, trend, description, className }: StatCardProps) {
  const trendColors = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  const trendArrows = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <SectionCard className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="bg-muted flex size-9 items-center justify-center rounded-lg">
                {icon}
              </div>
            )}

            <span className="text-muted-foreground text-sm font-medium">{title}</span>
          </div>

          {trend && (
            <span className={cn("text-sm font-medium", trendColors[trend.direction])}>
              {trendArrows[trend.direction]} {trend.value}
            </span>
          )}
        </div>

        <span className="text-3xl font-bold tracking-tight">{value}</span>

        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
    </SectionCard>
  );
}
