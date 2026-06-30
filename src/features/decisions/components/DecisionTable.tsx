"use client";

import { DataTable } from "@/components/shared/DataTable";
import type { Decision } from "@/types/decision.types";

interface DecisionTableProps {
  decisions: Decision[];
  onRowClick: (decision: Decision) => void;
}

const statusStyles: Record<string, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  "In Review": "bg-chart-5/10 text-chart-5",
  Resolved: "bg-chart-2/10 text-chart-2",
};

const severityStyles: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-chart-3/10 text-chart-3",
  Medium: "bg-chart-5/10 text-chart-5",
  Low: "bg-muted text-muted-foreground",
};

function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const DecisionTable = ({ decisions, onRowClick }: DecisionTableProps) => {
  return (
    <DataTable<Decision>
      columns={[
        { key: "id", label: "Decision ID" },
        { key: "organization", label: "Organization" },
        { key: "asset", label: "Asset" },
        { key: "risk", label: "Risk" },
        {
          key: "businessImpact",
          label: "Business Impact",
          render: (row) => (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                severityStyles[row.businessImpact]
              }`}
            >
              {row.businessImpact}
            </span>
          ),
        },
        {
          key: "confidence",
          label: "Confidence",
          render: (row) => <>{row.confidence}%</>,
        },
        { key: "owner", label: "Owner" },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                statusStyles[row.status]
              }`}
            >
              {row.status}
            </span>
          ),
        },
        {
          key: "priority",
          label: "Priority",
          render: (row) => (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                severityStyles[row.priority]
              }`}
            >
              {row.priority}
            </span>
          ),
        },
        {
          key: "time",
          label: "Time",
          render: (row) => <>{getRelativeTime(row.time)}</>,
        },
      ]}
      data={decisions}
      onRowClick={onRowClick}
      pageSize={50}
    />
  );
};

export default DecisionTable;
