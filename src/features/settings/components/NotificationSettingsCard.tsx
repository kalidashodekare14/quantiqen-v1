"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import type { NotificationSettings } from "@/types/settings.types";
import { fadeInUp } from "@/lib/motion";

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

  const handleToggle = (key: keyof NotificationSettings) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div {...fadeInUp(0.1)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
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
            <span className="text-card-foreground text-sm lg:text-base">{item.label}</span>
            <Switch checked={toggles[item.key]} onCheckedChange={() => handleToggle(item.key)} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default NotificationSettingsCard;
