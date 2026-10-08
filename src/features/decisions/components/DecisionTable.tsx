"use client";

import { DataTable } from "@/components/shared/DataTable";
import { statusBadgeClass, tierBadgeClass } from "../decision-badges";
import type { DecisionListItem } from "@/types/platform/decision-api.types";
import { formatRelativeTime } from "@/utils/date/date";

interface DecisionTableProps {
  decisions: DecisionListItem[];
  onRowClick: (decision: DecisionListItem) => void;
}

const DecisionTable = ({ decisions, onRowClick }: DecisionTableProps) => {
  return (
    <DataTable<DecisionListItem>
      columns={[
        {
          key: "id",
          label: "Decision ID",
          render: (row) => <span className="font-mono text-xs">{row.id.slice(0, 13)}…</span>,
        },
        {
          key: "finding",
          label: "Finding",
          render: (row) => (
            <span className="block max-w-60 truncate font-medium">{row.finding.title}</span>
          ),
        },
        {
          key: "risk",
          label: "Risk",
          render: (row) => (
            <span className="flex items-center gap-1.5">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${tierBadgeClass(row.risk.tier)}`}
              >
                {row.risk.tier} · {row.risk.riskScore}
              </span>
              <span className="text-muted-foreground text-xs">{row.risk.priority}</span>
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${statusBadgeClass(row.status)}`}
            >
              {row.status.replaceAll("_", " ")}
            </span>
          ),
        },
        {
          key: "updatedAt",
          label: "Updated",
          render: (row) => (
            <span className="text-muted-foreground text-sm">
              {formatRelativeTime(row.updatedAt)}
            </span>
          ),
        },
      ]}
      data={decisions}
      onRowClick={onRowClick}
      getRowId={(row) => row.id}
      pageSize={10}
    />
  );
};

export default DecisionTable;
