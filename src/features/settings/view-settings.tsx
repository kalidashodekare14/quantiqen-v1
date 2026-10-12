"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { useSettings } from "./hooks/useSettings";
import AppearanceSettings from "./components/AppearanceSettings";
import NotificationPreferencesCard from "./components/NotificationPreferencesCard";
import WebhooksCard from "./components/WebhooksCard";
import DeliveryLogCard from "./components/DeliveryLogCard";
import PreferencesCard from "./components/PreferencesCard";
import SecurityCard from "./components/SecurityCard";
import SettingsSkeleton from "./components/SettingsSkeleton";

const ViewSettings = () => {
  const { data, isLoading, isError, error } = useSettings();

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col gap-6">
        <PageHeader title="Settings" />
        <QueryErrorState error={error} message="Failed to load settings. Please try again." />
      </div>
    );
  }
  if (!data) return null;

  const { settings } = data;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader title="Settings" />

      <AppearanceSettings />

      <NotificationPreferencesCard />

      <WebhooksCard />

      <DeliveryLogCard />

      <PreferencesCard preferences={settings.preferences} />

      <SecurityCard security={settings.security} />
    </div>
  );
};

export default ViewSettings;
