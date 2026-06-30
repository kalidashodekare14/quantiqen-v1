"use client";

import { motion } from "framer-motion";
import { formatRelativeTime } from "@/utils/date/date";
import type { Profile } from "@/types/profile.types";

interface ProfileDetailsProps {
  profile: Profile;
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
    { label: "Timezone", value: profile.timezone },
    { label: "Joined", value: formatDate(profile.joinedAt) },
    { label: "Last Login", value: formatRelativeTime(profile.lastLogin) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-card w-full rounded-xl border p-5"
    >
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
            <span className="text-muted-foreground text-sm lg:text-base">
              {item.label}
            </span>
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
