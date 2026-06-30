"use client";

import { DataTable } from "@/components/shared/DataTable";
import type { Asset } from "@/types/asset.types";

interface AssetTableProps {
  assets: Asset[];
}

const criticalityStyles: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-chart-3/10 text-chart-3",
  Medium: "bg-chart-5/10 text-chart-5",
  Low: "bg-muted text-muted-foreground",
};

const statusStyles: Record<string, string> = {
  Active: "bg-chart-2/10 text-chart-2",
  "At Risk": "bg-destructive/10 text-destructive",
  Inactive: "bg-muted text-muted-foreground",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AssetTable = ({ assets }: AssetTableProps) => {
  return (
    <DataTable<Asset>
      columns={[
        { key: "domain", label: "Domain" },
        {
          key: "ipAddress",
          label: "IP Address",
          render: (row) => <span className="font-mono text-xs">{row.ipAddress}</span>,
        },
        { key: "assetType", label: "Asset Type" },
        { key: "owner", label: "Owner" },
        {
          key: "criticality",
          label: "Criticality",
          render: (row) => (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                criticalityStyles[row.criticality]
              }`}
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
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                statusStyles[row.status]
              }`}
            >
              {row.status}
            </span>
          ),
        },
        {
          key: "lastScan",
          label: "Last Scan",
          render: (row) => <span className="text-xs">{formatDate(row.lastScan)}</span>,
        },
      ]}
      data={assets}
      searchable
      getRowId={(row) => row.id}
      searchKeys={["domain", "owner"]}
      filterOptions={{ key: "status", options: ["Active", "At Risk", "Inactive"] }}
      pageSize={8}
    />
  );
};

export default AssetTable;
