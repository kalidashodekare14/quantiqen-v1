"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { formatRelativeTime } from "@/utils/date/date";
import LiveFeed from "./components/LiveFeed";
import MonitoringStats from "./components/MonitoringStats";
import MonitoringSkeleton from "./components/MonitoringSkeleton";
import { useMonitoring } from "./hooks/useMonitoring";

const ViewMonitoring = () => {
  const { data, isLoading } = useMonitoring();

  if (isLoading) {
    return <MonitoringSkeleton />;
  }

  if (!data) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Live Monitoring"
        subtitle="Auto-refreshes every 5 seconds"
        action={
          <span className="rounded-full bg-muted px-3 py-1 text-xs lg:text-sm text-muted-foreground">
            Last updated: {formatRelativeTime(data.lastUpdated)}
          </span>
        }
      />

      <MonitoringStats stats={data.stats} />

      <LiveFeed events={data.events} />
    </div>
  );
};

export default ViewMonitoring;
