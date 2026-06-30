"use client";

import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import LiveFeed from "./components/LiveFeed";
import MonitoringStats from "./components/MonitoringStats";
import { useMonitoring } from "./hooks/useMonitoring";

const ViewMonitoring = () => {
  const { data, isLoading } = useMonitoring();

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Live Monitoring"
        subtitle="Auto-refreshes every 5 seconds"
        action={
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            Last updated: just now
          </span>
        }
      />

      <MonitoringStats stats={data.stats} />

      <LiveFeed events={data.events} />
    </div>
  );
};

export default ViewMonitoring;
