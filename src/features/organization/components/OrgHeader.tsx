"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import type { PlatformOrganization } from "@/types/platform/organization.types";

interface OrgHeaderProps {
  data: PlatformOrganization;
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  SUSPENDED: "bg-destructive/10 text-destructive border-destructive/20",
  TRIAL: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

export const OrgHeader = ({ data }: OrgHeaderProps) => {
  const statusClass = statusStyles[data.status] ?? "bg-muted text-muted-foreground border-border";

  return (
    <motion.div {...fadeInUp()} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <div className="flex items-center gap-5">
        <div className="bg-chart-5/10 border-chart-5/20 flex size-16 items-center justify-center rounded-xl border">
          <span className="text-chart-5 text-2xl font-bold">
            {data.orgName.slice(0, 1).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-card-foreground text-xl font-bold">{data.orgName}</h2>

          <div className="flex flex-wrap items-center gap-3 lg:flex-row">
            <span className="bg-chart-5/10 text-chart-5 border-chart-5/20 rounded-full border px-2.5 py-1 text-xs font-medium lg:text-sm">
              {data.planTier}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium lg:text-sm ${statusClass}`}
            >
              {data.status}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
