"use client";

import { Progress } from "@/components/ui/progress";
import { getUsageColor } from "@/utils/color/getUsageColor";

type UsageTitle = "Daily Usage" | "Monthly Usage";

interface UsageProgressProps {
  title: UsageTitle;
  current: number;
  limit: number;
}

const UsageProgress = ({ title, current, limit }: UsageProgressProps) => {
  const ratio = limit > 0 ? current / limit : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs lg:text-sm">
        <span className="text-muted-foreground">{title}</span>

        <span className="text-card-foreground">
          {current.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>

      <Progress value={ratio * 100} indicatorClassName={getUsageColor(ratio)} />
    </div>
  );
};

export default UsageProgress;
