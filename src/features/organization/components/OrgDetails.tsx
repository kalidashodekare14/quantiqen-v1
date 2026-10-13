"use client";

import { motion } from "framer-motion";
import { Users, Server, Globe, Key } from "lucide-react";
import { StatPills } from "@/components/shared/StatPills";
import { formatMonthYear } from "@/utils/date/date";
import { fadeInUp } from "@/lib/motion";
import type { PlatformOrganization } from "@/types/platform/organization.types";

export interface OrgCounts {
  users: number;
  assets: number;
  domains: number;
  apiKeys: number;
}

interface OrgDetailsProps {
  org: PlatformOrganization;
  counts: OrgCounts;
}

export const OrgDetails = ({ org, counts }: OrgDetailsProps) => {
  const sections = [
    {
      title: "Overview",
      delay: 0,
      content: (
        <StatPills
          stats={[
            { value: counts.users, label: "Total Users", icon: Users },
            { value: counts.assets, label: "Total Assets", icon: Server },
            { value: counts.domains, label: "Domains", icon: Globe },
            { value: counts.apiKeys, label: "API Keys", icon: Key },
          ]}
        />
      ),
    },
    {
      title: "Details",
      delay: 0.1,
      content: (
        <div className="bg-card/80 backdrop-blur-md border border-foreground/10 rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
          {[
            { label: "Organization ID", value: org.id },
            { label: "Plan Tier", value: org.planTier },
            { label: "Status", value: org.status },
            { label: "Member Since", value: formatMonthYear(org.createdAt) },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-3 ${
                idx < 3 ? "border-border border-b" : ""
              }`}
            >
              <span className="text-muted-foreground text-sm lg:text-base">{item.label}</span>
              <span className="text-card-foreground text-sm font-medium lg:text-base">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-5">
      {sections.map((section) => (
        <motion.div key={section.title} {...fadeInUp()}>
          <h3 className="text-card-foreground mb-3 text-sm font-semibold lg:text-base">
            {section.title}
          </h3>
          {section.content}
        </motion.div>
      ))}
    </div>
  );
};
