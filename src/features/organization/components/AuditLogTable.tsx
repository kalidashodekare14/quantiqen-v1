"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import type { AuditLogEntry } from "../types/audit-log.types";

interface AuditLogTableProps {
  entries: AuditLogEntry[];
}

const outcomeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ALLOW: "default",
  DENY: "destructive",
  STEP_UP: "secondary",
  SUCCESS: "default",
  FAILURE: "destructive",
};

export function AuditLogTable({ entries }: AuditLogTableProps) {
  const columns = [
    {
      key: "createdAt" as const,
      label: "Time",
      render: (row: AuditLogEntry) => new Date(row.createdAt).toLocaleString(),
    },
    { key: "actorUserId" as const, label: "Actor" },
    { key: "action" as const, label: "Action" },
    { key: "resource" as const, label: "Resource" },
    {
      key: "outcome" as const,
      label: "Outcome",
      render: (row: AuditLogEntry) => (
        <Badge variant={outcomeVariant[row.outcome] ?? "outline"}>
          {row.outcome}
        </Badge>
      ),
    },
    { key: "ipAddr" as const, label: "IP Address" },
  ];

  return (
    <DataTable
      columns={columns}
      data={entries}
      searchable
      searchKeys={["actorUserId", "action", "resource"]}
      getRowId={(row) => row.id}
    />
  );
}
