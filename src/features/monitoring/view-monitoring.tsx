"use client";

import LiveFeed from "./components/LiveFeed";
import MonitoringStats from "./components/MonitoringStats";
import { useMonitoring } from "./hooks/useMonitoring";

const ViewMonitoring = () => {
  const { data, isLoading } = useMonitoring();

  if (isLoading) return null;
  if (!data) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-card-foreground">Live Monitoring</h1>
          <p className="text-sm text-muted-foreground">Auto-refreshes every 5 seconds</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Last updated: just now
        </span>
      </div>

      <MonitoringStats stats={data.stats} />

      <LiveFeed events={data.events} />
    </div>
  );
};

export default ViewMonitoring;
