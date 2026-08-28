"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AppButton from "@/components/shared/AppButton";
import { useUpdateProfile } from "../hooks/useProfile";
import type { PortalProfile } from "@/types/profile.types";
import { toast } from "sonner";

interface EditProfileModalProps {
  profile: PortalProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileModal = ({ profile, open, onOpenChange }: EditProfileModalProps) => {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const updateProfile = useUpdateProfile();

  const handleSubmit = async () => {
    try {
      await updateProfile.mutateAsync({
        displayName: displayName || null,
        email,
        phone,
      });
      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your display name, email, or phone number.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="edit-displayName">
              Display Name
            </label>
            <Input
              id="edit-displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alice Admin"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="edit-email">
              Email
            </label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice@acme.example"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="edit-phone">
              Phone
            </label>
            <Input
              id="edit-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +15550001000"
            />
          </div>
        </div>

        <DialogFooter>
          <AppButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </AppButton>
          <AppButton
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={updateProfile.isPending}
            disabled={updateProfile.isPending}
          >
            Save Changes
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
