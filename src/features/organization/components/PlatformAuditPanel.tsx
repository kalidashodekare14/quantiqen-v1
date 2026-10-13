"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { usePlatformAuditLog } from "../hooks/useAuditLog";
import { PlatformAuditTable } from "./PlatformAuditTable";
import type { PlatformAuditLogParams } from "@/types/platform/audit-api.types";

const PLATFORM_RESOURCE_TYPES = [
  "API_KEY",
  "SCAN",
  "DECISION",
  "NOTE",
  "RISK",
  "WEBHOOK_ENDPOINT",
  "ORGANIZATION",
  "USER",
  "REPORT",
  "CORRECTION",
  "UNKNOWN",
] as const;

const PAGE_SIZE = 10;

export function PlatformAuditPanel() {
  const [action, setAction] = useState("");
  const [resourceType, setResourceType] = useState("ALL");
  const [actorUserId, setActorUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const params: PlatformAuditLogParams = {
    page,
    limit: PAGE_SIZE,
    ...(action.trim() ? { action: action.trim() } : {}),
    ...(resourceType !== "ALL" ? { resourceType } : {}),
    ...(actorUserId.trim() ? { actorUserId: actorUserId.trim() } : {}),
    ...(from ? { from: new Date(from).toISOString() } : {}),
    ...(to ? { to: new Date(to).toISOString() } : {}),
  };

  const { data, isLoading, isError, error } = usePlatformAuditLog(params);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card flex flex-wrap items-end gap-3 rounded-xl p-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Action</span>
          <Input
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            placeholder="DECISION_APPROVED"
            className="h-9 w-48"
            aria-label="Filter by action"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Resource Type</span>
          <Select
            value={resourceType}
            onValueChange={(value) => {
              setResourceType(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-48" aria-label="Filter by resource type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All resources</SelectItem>
              {PLATFORM_RESOURCE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Actor User ID</span>
          <Input
            value={actorUserId}
            onChange={(e) => {
              setActorUserId(e.target.value);
              setPage(1);
            }}
            placeholder="user id"
            className="h-9 w-48"
            aria-label="Filter by actor user id"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">From</span>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="h-9 w-38"
            aria-label="Filter from date"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">To</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="h-9 w-38"
            aria-label="Filter to date"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{data?.total ?? 0} entries</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" />
      ) : isError ? (
        <QueryErrorState
          error={error}
          message="Failed to load platform audit log. Please try again."
        />
      ) : (
        <PlatformAuditTable entries={data?.data ?? []} />
      )}
    </div>
  );
}
