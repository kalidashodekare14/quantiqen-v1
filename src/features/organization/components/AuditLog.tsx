"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequireRole } from "@/components/auth/RequireRole";
import { usePortalAuditLog } from "../hooks/useAuditLog";
import { AuditLogTable } from "./AuditLogTable";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AuditLog() {
  const [actionFilter, setActionFilter] = useState<string>("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("");

  const params = {
    ...(actionFilter ? { action: actionFilter } : {}),
    ...(outcomeFilter ? { outcome: outcomeFilter } : {}),
  };

  const { data, isLoading, isError } = usePortalAuditLog(params);

  if (isLoading) return <LoadingSkeleton variant="table" />;

  return (
    <RequireRole
      allowedRoles={["CUSTOMER_ADMIN", "ANALYST", "AUDITOR"]}
      fallback={
        <div className="text-muted-foreground py-8 text-center">
          You don&apos;t have permission to view the audit log.
        </div>
      }
    >
      <div className="flex flex-col gap-6 w-full">
        <PageHeader
          title="Audit Log"
          subtitle="View organization activity and security events"
        />

        <div className="bg-card flex flex-wrap items-center gap-3 rounded-xl p-3">
          <Input
            placeholder="Filter by action..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-64"
          />
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 w-48 rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:ring-3">
              <SelectValue placeholder="All outcomes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALLOW">ALLOW</SelectItem>
              <SelectItem value="DENY">DENY</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <div className="text-muted-foreground py-8 text-center">
            Failed to load audit log. Please try again.
          </div>
        ) : (
          <AuditLogTable entries={data?.entries ?? []} />
        )}
      </div>
    </RequireRole>
  );
}
