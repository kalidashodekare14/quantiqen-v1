"use client";

import { motion } from "framer-motion";
import AppButton from "@/components/shared/AppButton";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/profile.types";

interface SecuritySettingsProps {
  profile: Profile;
}

const SecuritySettings = ({ profile }: SecuritySettingsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card w-full rounded-xl border p-5"
    >
      <h3 className="text-card-foreground mb-4 text-sm font-semibold lg:text-base">
        Security Settings
      </h3>

      <div className="flex flex-col">
        <div className="border-border flex items-center justify-between border-b py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-card-foreground text-sm font-medium lg:text-base">
              Two-Factor Authentication
            </span>
            <span className="text-muted-foreground text-xs lg:text-sm">
              {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={profile.twoFactorEnabled}
            disabled
            className={cn(
              "inline-flex h-5 w-9 shrink-0 cursor-not-allowed items-center rounded-full border-2 border-transparent transition-colors",
              profile.twoFactorEnabled
                ? "bg-chart-5"
                : "bg-muted",
            )}
          >
            <span
              className={cn(
                "pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform",
                profile.twoFactorEnabled ? "translate-x-4" : "translate-x-0",
              )}
            />
          </button>
        </div>

        <div className="pt-4">
          <AppButton variant="outline" size="md">
            Change Password
          </AppButton>
        </div>
      </div>
    </motion.div>
  );
};

export default SecuritySettings;
