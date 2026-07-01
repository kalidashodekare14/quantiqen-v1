"use client";

import { motion } from "framer-motion";
import { Users, Server, Globe, Key } from "lucide-react";
import { StatPills } from "@/components/shared/StatPills";
import { OrganizationData } from "@/types/organization.types";
import { formatDate, formatMonthYear } from "@/utils/date/date";
import { fadeInUp } from "@/lib/motion";

interface OrgDetailsProps {
  data: OrganizationData;
}

export const OrgDetails = ({ data }: OrgDetailsProps) => {
  const subscriptionProgress = Math.min((data.subscription.daysRemaining / 365) * 100, 100);

  const sections = [
    {
      title: "Overview",
      delay: 0,
      content: (
        <StatPills
          stats={[
            { value: data.users, label: "Total Users", icon: Users },
            { value: data.assets, label: "Total Assets", icon: Server },
            { value: data.domains, label: "Domains", icon: Globe },
            { value: data.apiKeys, label: "API Keys", icon: Key },
          ]}
        />
      ),
    },
    {
      title: "Subscription",
      delay: 0.1,
      content: (
        <>
          <div className="bg-card rounded-xl border p-5">
            <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: "Plan", value: data.subscription.plan },
                { label: "Status", value: data.subscription.status },
                {
                  label: "Start Date",
                  value: formatDate(data.subscription.startDate),
                },
                {
                  label: "Expiry Date",
                  value: formatDate(data.subscription.expiryDate),
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-muted-foreground text-xs lg:text-sm">{item.label}</p>
                  <p className="text-card-foreground text-sm font-medium lg:text-base">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs lg:text-sm">Days Remaining</span>
                <span className="text-chart-2 text-xs lg:text-sm">
                  {data.subscription.daysRemaining} days
                </span>
              </div>
              <div className="bg-muted mt-2 h-2 w-full rounded-full">
                <div
                  className="bg-chart-2 h-full rounded-full"
                  style={{
                    width: `${subscriptionProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Details",
      delay: 0.2,
      content: (
        <div className="bg-card rounded-xl border p-5">
          {[
            { label: "Organization ID", value: data.id },
            { label: "Email", value: data.email },
            { label: "Country", value: data.country },
            {
              label: "Member Since",
              value: formatMonthYear(data.createdAt),
            },
            { label: "Website", value: data.website },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-3 ${
                idx < 4 ? "border-border border-b" : ""
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
