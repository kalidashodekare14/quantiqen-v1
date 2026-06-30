"use client";

import { motion } from "framer-motion";
import AppButton from "@/components/shared/AppButton";
import type { SecuritySettingsData } from "@/types/settings.types";

interface SecurityCardProps {
  security: SecuritySettingsData;
}

const SecurityCard = ({ security }: SecurityCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card w-full rounded-xl border p-5"
    >
      <h3 className="text-card-foreground mb-4 text-sm font-semibold lg:text-base">
        Security
      </h3>

      <div className="flex flex-col">
        <div className="border-border flex items-center justify-between border-b py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-card-foreground text-sm font-medium lg:text-base">
              Two-Factor Authentication
            </span>
            <span
              className={`inline-block w-fit rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${
                security.twoFactorEnabled
                  ? "bg-chart-2/10 text-chart-2"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {security.twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <AppButton variant="outline" size="sm">
            Manage
          </AppButton>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-card-foreground text-sm font-medium lg:text-base">
              Session Timeout
            </span>
            <span className="text-muted-foreground text-xs lg:text-sm">
              {security.sessionTimeout}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityCard;
