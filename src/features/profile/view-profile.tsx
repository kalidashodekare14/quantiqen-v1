"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useProfile } from "./hooks/useProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileDetails from "./components/ProfileDetails";
import SecuritySettings from "./components/SecuritySettings";
import ProfileSkeleton from "./components/ProfileSkeleton";

const ViewProfile = () => {
  const { data: user, isLoading, isError } = useProfile();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !user) {
    return (
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title="Profile"
          subtitle="Manage your personal information"
        />
        <div className="text-muted-foreground py-8 text-center">
          Failed to load profile. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information"
      />

      <ProfileHeader profile={user} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProfileDetails profile={user} />
        <SecuritySettings profile={user} />
      </div>
    </div>
  );
};

export default ViewProfile;
