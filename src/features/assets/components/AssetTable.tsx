"use client";

import { DataTable } from "@/components/shared/DataTable";
import { formatRelativeTime } from "@/utils/date/date";
import type { PlatformAsset } from "@/types/platform/asset-api.types";

interface AssetTableProps {
  assets: PlatformAsset[];
  onRowClick?: (asset: PlatformAsset) => void;
}

export const criticalityStyles: Record<string, string> = {
  CRITICAL: "bg-destructive/10 text-destructive",
  HIGH: "bg-chart-3/10 text-chart-3",
  MEDIUM: "bg-chart-5/10 text-chart-5",
  LOW: "bg-muted text-muted-foreground",
  UNRATED: "bg-muted text-muted-foreground",
};

export const assetStatusStyles: Record<string, string> = {
  ACTIVE: "bg-chart-2/10 text-chart-2",
  INACTIVE: "bg-muted text-muted-foreground",
  UNKNOWN: "bg-chart-3/10 text-chart-3",
};

const AssetTable = ({ assets, onRowClick }: AssetTableProps) => {
  return (
    <DataTable<PlatformAsset>
      columns={[
        {
          key: "name",
          label: "Name",
          render: (row) => <span className="font-medium">{row.name}</span>,
        },
        {
          key: "identifier",
          label: "Identifier",
          render: (row) => <span className="font-mono text-sm">{row.identifier}</span>,
        },
        { key: "assetType", label: "Type" },
        { key: "environment", label: "Environment" },
        {
          key: "criticality",
          label: "Criticality",
          render: (row) => (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${criticalityStyles[row.criticality] ?? "bg-muted text-muted-foreground"}`}
            >
              {row.criticality}
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (row) => (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${assetStatusStyles[row.status] ?? "bg-muted text-muted-foreground"}`}
            >
              {row.status}
            </span>
          ),
        },
        {
          key: "lastSeenAt",
          label: "Last Seen",
          render: (row) => (
            <span className="text-muted-foreground text-sm">
              {row.lastSeenAt ? formatRelativeTime(row.lastSeenAt) : "—"}
            </span>
          ),
        },
      ]}
      data={assets}
      searchable
      onRowClick={onRowClick}
      getRowId={(row) => row.id}
      searchKeys={["name", "identifier"]}
      pageSize={8}
    />
  );
};

export default AssetTable;
