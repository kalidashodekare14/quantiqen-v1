"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import AppButton from "@/components/shared/AppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getFriendlyError } from "@/utils/errorMessages";
import type { PortalProfile } from "@/types/profile.types";
import { fadeInUp } from "@/lib/motion";
import { useChangePassword } from "../hooks/useProfile";

interface SecuritySettingsProps {
  profile: PortalProfile;
}

const MIN_PASSWORD_LENGTH = 8;

const SecuritySettings = ({ profile }: SecuritySettingsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useChangePassword();

  const closeDialog = () => {
    setDialogOpen(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    changePassword.mutate(newPassword, {
      onSuccess: () => {
        toast.success("Password changed.");
        closeDialog();
      },
      onError: (error) => toast.error(getFriendlyError(error).message),
    });
  };

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
          <AppButton variant="outline" size="md" onClick={() => setDialogOpen(true)}>
            Change Password
          </AppButton>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Choose a new password for your account. It must be at least {MIN_PASSWORD_LENGTH}{" "}
              characters.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={changePassword.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePassword.isPending || !newPassword || !confirmPassword}
            >
              {changePassword.isPending ? "Changing…" : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SecuritySettings;
