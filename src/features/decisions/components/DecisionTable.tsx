"use client";

import { DataTable } from "@/components/shared/DataTable";
import { severityStyles } from "@/constants/severity";
import type { Decision } from "@/types/decision.types";
import { formatRelativeTime } from "@/utils/date/date";

interface DecisionTableProps {
  decisions: Decision[];
  onRowClick: (decision: Decision) => void;
}

const statusStyles: Record<string, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  "In Review": "bg-chart-5/10 text-chart-5",
  Resolved: "bg-chart-2/10 text-chart-2",
};

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
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${
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
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${
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
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${
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
          render: (row) => <>{formatRelativeTime(row.time)}</>,
        },
      ]}
      data={decisions}
      onRowClick={onRowClick}
      getRowId={(row) => row.id}
      pageSize={50}
    />
  );
};

export default DecisionTable;
