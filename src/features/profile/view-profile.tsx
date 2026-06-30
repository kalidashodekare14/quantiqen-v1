"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useProfile } from "./hooks/useProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileDetails from "./components/ProfileDetails";
import SecuritySettings from "./components/SecuritySettings";
import ProfileSkeleton from "./components/ProfileSkeleton";

const ViewProfile = () => {
  const { data, isLoading, isError } = useProfile();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) return null;
  if (!data) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information"
      />

      <ProfileHeader profile={data.profile} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProfileDetails profile={data.profile} />
        <SecuritySettings profile={data.profile} />
      </div>
    </div>
  );
};

export default ViewProfile;
