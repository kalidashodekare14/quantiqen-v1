"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { formatDateTime } from "@/utils/date/date";
import type { PlatformAuditLogEntry } from "@/types/platform/audit-api.types";

interface PlatformAuditTableProps {
  entries: PlatformAuditLogEntry[];
}

const JsonBlock = ({ label, value }: { label: string; value: Record<string, unknown> }) => {
  const isEmpty = Object.keys(value).length === 0;
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
        {label}
      </p>
      <pre className="bg-muted text-card-foreground max-h-40 overflow-auto rounded-lg p-2 text-xs">
        {isEmpty ? "{}" : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
};

const AuditEntryDialog = ({
  entry,
  onClose,
}: {
  entry: PlatformAuditLogEntry;
  onClose: () => void;
}) => (
  <Dialog open onOpenChange={(next) => !next && onClose()}>
    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex flex-wrap items-center gap-2">
          {entry.action}
          <Badge variant="outline">{entry.resourceType}</Badge>
        </DialogTitle>
        <DialogDescription>
          {formatDateTime(entry.createdAt)} · {entry.actorRole}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Actor</p>
          <p className="text-card-foreground font-medium">{entry.actorUserId}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Resource ID</p>
          <p className="text-card-foreground font-mono text-xs">{entry.resourceId || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">IP Address</p>
          <p className="text-card-foreground font-medium">{entry.ipAddress || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Correlation ID</p>
          <p className="text-card-foreground font-mono text-xs">
            {entry.correlationId || "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <JsonBlock label="Before" value={entry.beforeJson} />
        <JsonBlock label="After" value={entry.afterJson} />
      </div>

      <div>
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
          Hash Chain
        </p>
        <p className="text-card-foreground font-mono text-xs break-all">{entry.hash}</p>
      </div>
    </DialogContent>
  </Dialog>
);

export function PlatformAuditTable({ entries }: PlatformAuditTableProps) {
  const [selected, setSelected] = useState<PlatformAuditLogEntry | null>(null);

  const columns = [
    {
      key: "createdAt" as const,
      label: "Time",
      render: (row: PlatformAuditLogEntry) => formatDateTime(row.createdAt),
    },
    { key: "action" as const, label: "Action" },
    {
      key: "actorUserId" as const,
      label: "Actor",
      render: (row: PlatformAuditLogEntry) => (
        <span className="flex flex-col">
          <span className="text-card-foreground text-sm">{row.actorUserId}</span>
          <span className="text-muted-foreground text-xs">{row.actorRole}</span>
        </span>
      ),
    },
    {
      key: "resourceType" as const,
      label: "Resource",
      render: (row: PlatformAuditLogEntry) => (
        <span className="flex flex-col">
          <span className="text-card-foreground text-sm">{row.resourceType}</span>
          <span className="text-muted-foreground font-mono text-xs">
            {row.resourceId ? `${row.resourceId.slice(0, 12)}…` : "—"}
          </span>
        </span>
      ),
    },
    { key: "ipAddress" as const, label: "IP Address" },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={entries}
        searchable
        searchKeys={["action", "actorUserId", "resourceType", "resourceId"]}
        getRowId={(row) => row.id}
        onRowClick={setSelected}
      />
      {selected && <AuditEntryDialog entry={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
