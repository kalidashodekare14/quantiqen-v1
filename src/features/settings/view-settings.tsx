"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useSettings } from "./hooks/useSettings";
import AppearanceSettings from "./components/AppearanceSettings";
import NotificationSettingsCard from "./components/NotificationSettingsCard";
import PreferencesCard from "./components/PreferencesCard";
import SecurityCard from "./components/SecurityCard";
import SettingsSkeleton from "./components/SettingsSkeleton";

const ViewSettings = () => {
  const { data, isLoading, isError } = useSettings();

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (isError) return null;
  if (!data) return null;

  const { settings } = data;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader title="Settings" />

      <AppearanceSettings />

      <NotificationSettingsCard notifications={settings.notifications} />

      <PreferencesCard preferences={settings.preferences} />

      <SecurityCard security={settings.security} />
    </div>
  );
};

export default ViewSettings;
