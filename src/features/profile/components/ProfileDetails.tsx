"use client";

import { motion } from "framer-motion";
import { formatRelativeTime } from "@/utils/date/date";
import type { PortalProfile } from "@/types/profile.types";
import { fadeInUp } from "@/lib/motion";

interface ProfileDetailsProps {
  profile: PortalProfile;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const ProfileDetails = ({ profile }: ProfileDetailsProps) => {
  const items = [
    { label: "Email", value: profile.email },
    { label: "Phone", value: profile.phone },
    { label: "Role", value: profile.role },
    { label: "Status", value: profile.status },
    { label: "Organization", value: profile.organizationName },
    { label: "MFA Enabled", value: profile.mfaEnabled ? "Yes" : "No" },
    { label: "Joined", value: formatDate(profile.createdAt) },
    { label: "Last Login", value: profile.lastLoginAt ? formatRelativeTime(profile.lastLoginAt) : "Never" },
  ];

  return (
    <motion.div {...fadeInUp(0.2)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <h3 className="text-card-foreground mb-4 text-sm font-semibold lg:text-base">
        Profile Details
      </h3>

      <div className="flex flex-col">
        {items.map((item, idx) => (
          <div
            key={item.label}
            className={`flex items-center justify-between py-3 ${
              idx < items.length - 1 ? "border-border border-b" : ""
            }`}
          >
            <span className="text-muted-foreground text-sm lg:text-base">{item.label}</span>
            <span className="text-card-foreground text-right text-sm font-medium lg:text-base">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileDetails;
