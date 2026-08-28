"use client";

import { motion } from "framer-motion";
import AppButton from "@/components/shared/AppButton";
import { cn } from "@/lib/utils";
import type { PortalProfile } from "@/types/profile.types";
import { fadeInUp } from "@/lib/motion";

interface SecuritySettingsProps {
  profile: PortalProfile;
}

const SecuritySettings = ({ profile }: SecuritySettingsProps) => {
  return (
    <motion.div {...fadeInUp(0.2)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
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
              {profile.mfaEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={profile.mfaEnabled}
            disabled
            className={cn(
              "inline-flex h-5 w-9 shrink-0 cursor-not-allowed items-center rounded-full border-2 border-transparent transition-colors",
              profile.mfaEnabled ? "bg-chart-5" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform",
                profile.mfaEnabled ? "translate-x-4" : "translate-x-0",
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
