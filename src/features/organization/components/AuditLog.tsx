"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { RequireRole } from "@/components/auth/RequireRole";
import { usePortalAuditLog } from "../hooks/useAuditLog";
import { AuditLogTable } from "./AuditLogTable";
import { PlatformAuditPanel } from "./PlatformAuditPanel";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { AUDIT_ACTIONS, AUDIT_OUTCOMES } from "@/constants/audit-log";

type AuditSource = "portal" | "platform";

export function AuditLog() {
  const [source, setSource] = useState<AuditSource>("portal");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("");

  const { hasAnyRole } = useRole();
  const canViewPlatformAudit = hasAnyRole(["CUSTOMER_ADMIN", "AUDITOR"]);

  const params = {
    ...(actionFilter ? { action: actionFilter } : {}),
    ...(outcomeFilter ? { outcome: outcomeFilter } : {}),
  };

  const { data, isLoading, isError, error } = usePortalAuditLog(
    source === "portal" ? params : undefined,
  );

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
          <div className="border-border bg-muted/40 flex rounded-lg border p-0.5">
            {(
              [
                { id: "portal", label: "Portal" },
                { id: "platform", label: "Platform" },
              ] as Array<{ id: AuditSource; label: string }>
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSource(option.id)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  source === option.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {source === "portal" && (
            <>
              <Select
                value={actionFilter}
                onValueChange={(val) => setActionFilter(val === "ALL" ? "" : val)}
              >
                <SelectTrigger className="border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 w-64 rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:ring-3">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All actions</SelectItem>
                  {AUDIT_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={outcomeFilter}
                onValueChange={(val) => setOutcomeFilter(val === "ALL" ? "" : val)}
              >
                <SelectTrigger className="border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 w-48 rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:ring-3">
                  <SelectValue placeholder="All outcomes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All outcomes</SelectItem>
                  {AUDIT_OUTCOMES.map((outcome) => (
                    <SelectItem key={outcome} value={outcome}>
                      {outcome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {source === "platform" ? (
          canViewPlatformAudit ? (
            <PlatformAuditPanel />
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              Platform audit log requires CUSTOMER_ADMIN or AUDITOR role.
            </div>
          )
        ) : isLoading ? (
          <LoadingSkeleton variant="table" />
        ) : isError ? (
          <QueryErrorState error={error} message="Failed to load audit log. Please try again." />
        ) : (
          <AuditLogTable entries={data?.entries ?? []} />
        )}
      </div>
    </RequireRole>
  );
}
