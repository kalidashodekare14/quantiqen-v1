"use client";

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppButton from "@/components/shared/AppButton";
import type { Profile } from "@/types/profile.types";

interface EditProfileModalProps {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const inputClass =
  "flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-chart-5/50";

const labelClass = "text-sm font-medium text-card-foreground lg:text-base";

const EditProfileModal = ({ profile, open, onOpenChange }: EditProfileModalProps) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [department, setDepartment] = useState(profile.department);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone);
      setDepartment(profile.department);
      setTimezone(profile.timezone);
      setSaved(false);
    }
  }, [open, profile]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onOpenChange(false);
    }, 1500);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className={labelClass}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="department" className={labelClass}>
              Department
            </label>
            <input
              id="department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="timezone" className={labelClass}>
              Timezone
            </label>
            <input
              id="timezone"
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-chart-2">
              <CheckCircle2 className="size-4" />
              Profile updated
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <AppButton variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </AppButton>
            <AppButton variant="primary" size="sm" onClick={handleSave}>
              Save
            </AppButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
