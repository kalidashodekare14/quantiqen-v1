"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import type { NotificationSettings } from "@/types/settings.types";

interface NotificationSettingsCardProps {
  notifications: NotificationSettings;
}

const TOGGLES: { key: keyof NotificationSettings; label: string }[] = [
  { key: "emailAlerts", label: "Email Alerts" },
  { key: "newRiskAlerts", label: "New Risk Alerts" },
  { key: "decisionUpdates", label: "Decision Updates" },
  { key: "weeklyDigest", label: "Weekly Digest" },
  { key: "apiLimitWarnings", label: "API Limit Warnings" },
];

const NotificationSettingsCard = ({ notifications }: NotificationSettingsCardProps) => {
  const [toggles, setToggles] = useState(notifications);

  useEffect(() => {
    setToggles(notifications);
  }, [notifications]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-card w-full rounded-xl border p-5"
    >
      <h3 className="text-card-foreground mb-4 text-sm font-semibold lg:text-base">
        Notifications
      </h3>

      <div className="flex flex-col">
        {TOGGLES.map((item, idx) => (
          <div
            key={item.key}
            className={`flex items-center justify-between py-3 ${
              idx < TOGGLES.length - 1 ? "border-border border-b" : ""
            }`}
          >
            <span className="text-card-foreground text-sm lg:text-base">
              {item.label}
            </span>
            <Switch
              checked={toggles[item.key]}
              onCheckedChange={() => handleToggle(item.key)}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default NotificationSettingsCard;
