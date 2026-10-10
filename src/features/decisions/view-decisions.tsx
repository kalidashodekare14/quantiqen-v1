"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/shared/PageHeader";
import AppButton from "@/components/shared/AppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHealthCheck } from "./hooks/useHealthCheck";
import { useAnalyzeDecisions, useDecisions } from "./hooks/useDecisions";
import { useRole } from "@/hooks/use-role";
import { useUsers } from "@/hooks/use-users";
import { getFriendlyError } from "@/utils/errorMessages";
import { toast } from "sonner";
import type {
  DecisionListStatus,
  DecisionListItem,
  RiskTier,
} from "@/types/platform/decision-api.types";
import DecisionTable from "./components/DecisionTable";
import HealthBanner from "./components/HealthBanner";
import DecisionsSkeleton from "./components/DecisionsSkeleton";

const DecisionDetailPanel = dynamic(() => import("./components/DecisionDetailPanel"), {
  ssr: false,
});

const LIST_STATUSES: DecisionListStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
  "EXPIRED",
];

const RISK_TIERS: RiskTier[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const PAGE_SIZE = 20;
const ANALYZE_POLL_INTERVAL_MS = 5000;
const ANALYZE_POLL_WINDOW_MS = 30000;

const dayStartIso = (value: string) => new Date(`${value}T00:00:00`).toISOString();
const dayEndIso = (value: string) => new Date(`${value}T23:59:59.999`).toISOString();

const ViewDecisions = () => {
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pollUntil, setPollUntil] = useState(0);

  const { hasAnyRole } = useRole();
  const canQueueAnalysis = hasAnyRole(["CUSTOMER_ADMIN", "ANALYST"]);
  const { data: users } = useUsers();

  const listParams = {
    page,
    limit: PAGE_SIZE,
    ...(statusFilter !== "ALL" ? { status: statusFilter as DecisionListStatus } : {}),
    ...(severityFilter !== "ALL" ? { severity: severityFilter as RiskTier } : {}),
    ...(ownerFilter !== "ALL" ? { assignedToUserId: ownerFilter } : {}),
    ...(dateFrom ? { dateFrom: dayStartIso(dateFrom) } : {}),
    ...(dateTo ? { dateTo: dayEndIso(dateTo) } : {}),
  };

  const {
    data: decisionsData,
    isLoading: decisionsLoading,
    isError: decisionsError,
    refetch: refetchDecisions,
  } = useDecisions(listParams, {
    refetchInterval: () => (Date.now() < pollUntil ? ANALYZE_POLL_INTERVAL_MS : false),
  });

  const { isError: isHealthError } = useHealthCheck();
  const analyzeDecisions = useAnalyzeDecisions();

  const handleQueueAnalysis = () => {
    analyzeDecisions.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`Queued ${data.enqueuedCount} decision(s) for analysis.`);
        setPollUntil(Date.now() + ANALYZE_POLL_WINDOW_MS);
        refetchDecisions();
      },
      onError: (error) => toast.error(getFriendlyError(error).message),
    });
  };

  const totalPages = decisionsData?.totalPages ?? 1;

  const resetPageAndSet = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const headerAction = (
    <AppButton
      variant="primary"
      size="md"
      disabled={analyzeDecisions.isPending || isHealthError}
      loading={analyzeDecisions.isPending}
      onClick={handleQueueAnalysis}
    >
      Queue Re-analysis
    </AppButton>
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <HealthBanner />

      <PageHeader title="Decision Center" action={canQueueAnalysis ? headerAction : null} />

      <div className="bg-card flex flex-wrap items-end gap-3 rounded-xl p-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Status</span>
          <Select value={statusFilter} onValueChange={resetPageAndSet(setStatusFilter)}>
            <SelectTrigger className="h-9 w-44" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {LIST_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Severity</span>
          <Select value={severityFilter} onValueChange={resetPageAndSet(setSeverityFilter)}>
            <SelectTrigger className="h-9 w-40" aria-label="Filter by severity">
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All severities</SelectItem>
              {RISK_TIERS.map((tier) => (
                <SelectItem key={tier} value={tier}>
                  {tier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Owner</span>
          <Select value={ownerFilter} onValueChange={resetPageAndSet(setOwnerFilter)}>
            <SelectTrigger className="h-9 w-48" aria-label="Filter by assigned owner">
              <SelectValue placeholder="All owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All owners</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.qipUserId} value={user.qipUserId}>
                  {user.name ?? user.email ?? user.qipUserId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">From</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
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
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="h-9 w-38"
            aria-label="Filter to date"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
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

      {decisionsLoading ? (
        <DecisionsSkeleton />
      ) : decisionsError ? (
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">Unable to load decisions.</p>
          <Button variant="outline" size="sm" onClick={() => refetchDecisions()}>
            Retry
          </Button>
        </div>
      ) : (
        <DecisionTable
          decisions={decisionsData?.decisions ?? []}
          onRowClick={(decision: DecisionListItem) => setSelectedDecisionId(decision.id)}
          pageSize={PAGE_SIZE}
        />
      )}

      {selectedDecisionId && (
        <DecisionDetailPanel
          decisionId={selectedDecisionId}
          onClose={() => setSelectedDecisionId(null)}
        />
      )}
    </div>
  );
};

export default ViewDecisions;
