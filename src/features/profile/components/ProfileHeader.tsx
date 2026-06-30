"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AppButton from "@/components/shared/AppButton";
import EditProfileModal from "./EditProfileModal";
import type { Profile } from "@/types/profile.types";

interface ProfileHeaderProps {
  profile: Profile;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card flex items-center justify-between rounded-xl border p-6"
      >
        <div className="flex items-center gap-5">
          <div className="bg-chart-5/10 border-chart-5/20 flex size-16 items-center justify-center rounded-xl border">
            <span className="text-chart-5 text-2xl font-bold">
              {profile.avatarInitials}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-card-foreground text-xl font-bold">{profile.name}</h2>
            <p className="text-muted-foreground text-sm lg:text-base">{profile.role}</p>
            <span className="bg-chart-5/10 text-chart-5 border-chart-5/20 mt-0.5 w-fit rounded-full border px-2.5 py-1 text-xs font-medium lg:text-sm">
              {profile.department}
            </span>
          </div>
        </div>

        <AppButton variant="outline" size="md" onClick={() => setEditOpen(true)}>
          Edit Profile
        </AppButton>
      </motion.div>

      <EditProfileModal
        profile={profile}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
};

export default ProfileHeader;
