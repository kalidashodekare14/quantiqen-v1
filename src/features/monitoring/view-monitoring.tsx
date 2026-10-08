"use client";

import { useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime } from "@/utils/date/date";
import type { EventSeverity } from "@/types/monitoring.types";
import LiveFeed from "./components/LiveFeed";
import MonitoringStats from "./components/MonitoringStats";
import MonitoringSkeleton from "./components/MonitoringSkeleton";
import NetworkObservationsPanel from "./components/NetworkObservationsPanel";
import SituationsPanel from "./components/SituationsPanel";
import { useMonitoring } from "./hooks/useMonitoring";

type FeedTab = "feed" | "situations" | "observations";

const TABS: Array<{ id: FeedTab; label: string }> = [
  { id: "feed", label: "Live Feed" },
  { id: "situations", label: "Situations" },
  { id: "observations", label: "Network Observations" },
];

const SEVERITY_FILTERS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "success", label: "Success" },
  { value: "info", label: "Info" },
];

const ViewMonitoring = () => {
  const [activeTab, setActiveTab] = useState<FeedTab>("feed");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const { data, isLoading } = useMonitoring();

  if (isLoading) {
    return <MonitoringSkeleton />;
  }

  if (!data) return null;

  const filteredEvents =
    severityFilter === "ALL"
      ? data.events
      : data.events.filter((event) => event.severity === (severityFilter as EventSeverity));

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

      <div className="bg-card flex flex-wrap items-center gap-2 rounded-xl p-1.5">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? "" : "text-muted-foreground"}
          >
            {tab.label}
          </Button>
        ))}

        {activeTab === "feed" && (
          <div className="ml-auto w-48">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-9" aria-label="Filter feed by severity">
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {activeTab === "feed" && <LiveFeed events={filteredEvents} />}
      {activeTab === "situations" && <SituationsPanel />}
      {activeTab === "observations" && <NetworkObservationsPanel />}
    </div>
  );
};

export default ViewMonitoring;
