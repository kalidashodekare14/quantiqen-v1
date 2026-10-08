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
import { useFindings } from "./hooks/useFindings";
import { useHealthCheck } from "./hooks/useHealthCheck";
import { useAIDecision } from "./hooks/useAIDecision";
import { useAnalyzeDecisions, useDecisions } from "./hooks/useDecisions";
import { useRole } from "@/hooks/use-role";
import { getFriendlyError } from "@/utils/errorMessages";
import { toast } from "sonner";
import type { AIDecisionItem, AIDecisionRequest } from "@/types/ai-engine.types";
import type { Finding } from "@/types/finding.types";
import type {
  DecisionListStatus,
  DecisionListItem,
  RiskTier,
} from "@/types/platform/decision-api.types";
import FindingsTable from "./components/FindingsTable";
import AIDecisionsTable from "./components/AIDecisionsTable";
import DecisionTable from "./components/DecisionTable";
import HealthBanner from "./components/HealthBanner";
import DecisionsSkeleton from "./components/DecisionsSkeleton";

const FindingSidePanel = dynamic(() => import("./components/FindingSidePanel"), { ssr: false });
const AIDecisionSidePanel = dynamic(() => import("./components/AIDecisionSidePanel"), {
  ssr: false,
});
const DecisionDetailPanel = dynamic(() => import("./components/DecisionDetailPanel"), {
  ssr: false,
});

type Tab = "decisions" | "pending" | "analyzed";

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

const buildPayload = (findings: Finding[]): AIDecisionRequest => ({
  organization: findings[0]?.organization ?? "Acme Corp",
  findings: findings.map((f) => ({
    finding_id: f.id,
    title: f.title,
    description: f.description,
    severity: f.severity,
    category: f.category,
    affected_asset: f.affected_asset,
    asset_type: f.asset_type,
  })),
});

const ViewDecisions = () => {
  const [activeTab, setActiveTab] = useState<Tab>("decisions");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedAIDecision, setSelectedAIDecision] = useState<AIDecisionItem | null>(null);
  const [aiDecisions, setAIDecisions] = useState<AIDecisionItem[]>([]);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const { hasAnyRole } = useRole();
  const canQueueAnalysis = hasAnyRole(["CUSTOMER_ADMIN", "ANALYST"]);

  const listParams = {
    page,
    limit: PAGE_SIZE,
    ...(statusFilter !== "ALL" ? { status: statusFilter as DecisionListStatus } : {}),
    ...(severityFilter !== "ALL" ? { severity: severityFilter as RiskTier } : {}),
    ...(dateFrom ? { dateFrom: new Date(dateFrom).toISOString() } : {}),
    ...(dateTo ? { dateTo: new Date(dateTo).toISOString() } : {}),
  };

  const {
    data: decisionsData,
    isLoading: decisionsLoading,
    isError: decisionsError,
    refetch: refetchDecisions,
  } = useDecisions(listParams);

  const analyzedIds = aiDecisions.map((d) => d.finding_id);

  const { data: findingsData, isLoading } = useFindings();
  const { isError: isHealthError } = useHealthCheck();
  const { mutate, isPending } = useAIDecision();
  const analyzeDecisions = useAnalyzeDecisions();

  const handleQueueAnalysis = () => {
    analyzeDecisions.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`Queued ${data.enqueuedCount} decision(s) for analysis.`);
        refetchDecisions();
      },
      onError: (error) => toast.error(getFriendlyError(error).message),
    });
  };

  const handleBatchAnalyze = () => {
    const pending = findingsData?.findings.filter((f) => !analyzedIds.includes(f.id)) ?? [];
    if (pending.length === 0) return;
    mutate(buildPayload(pending), {
      onSuccess: (data) => {
        setAIDecisions((prev) => [...prev, ...data.decisions]);
        setActiveTab("analyzed");
      },
    });
  };

  const handleAnalyzeSingle = (finding: Finding) => {
    mutate(buildPayload([finding]), {
      onSuccess: (data) => {
        setAIDecisions((prev) => [...prev, ...data.decisions]);
        setSelectedFinding(null);
        setActiveTab("analyzed");
      },
    });
  };

  const pendingCount = findingsData?.findings.filter((f) => !analyzedIds.includes(f.id)).length ?? 0;
  const analyzedCount = aiDecisions.length;
  const totalCount = decisionsData?.total ?? 0;
  const totalPages = decisionsData?.totalPages ?? 1;

  const tabClass = (tab: Tab) =>
    `px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
      activeTab === tab
        ? "border-b-2 border-primary text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const resetPageAndSet = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const headerAction = (
    <div className="flex items-center gap-2">
      {canQueueAnalysis && (
        <AppButton
          variant="outline"
          size="md"
          disabled={analyzeDecisions.isPending || isHealthError}
          loading={analyzeDecisions.isPending}
          onClick={handleQueueAnalysis}
        >
          Queue Re-analysis
        </AppButton>
      )}
      <AppButton
        variant="primary"
        size="md"
        disabled={isPending || isHealthError || pendingCount === 0}
        loading={isPending}
        onClick={handleBatchAnalyze}
      >
        Run AI Analysis
      </AppButton>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <HealthBanner />

      <PageHeader title="Decision Center" action={headerAction} />

      <div className="border-foreground/10 mb-4 flex border-b">
        <button className={tabClass("decisions")} onClick={() => setActiveTab("decisions")}>
          Decisions
          <span className="bg-primary/10 text-primary ml-2 rounded-full px-2 py-0.5 text-xs">
            {activeTab === "decisions" ? totalCount : ""}
          </span>
        </button>
        <button className={tabClass("pending")} onClick={() => setActiveTab("pending")}>
          Pending
          <span className="bg-primary/10 text-primary ml-2 rounded-full px-2 py-0.5 text-xs">
            {pendingCount}
          </span>
        </button>
        <button className={tabClass("analyzed")} onClick={() => setActiveTab("analyzed")}>
          Analyzed
          <span className="bg-primary/10 text-primary ml-2 rounded-full px-2 py-0.5 text-xs">
            {analyzedCount}
          </span>
        </button>
      </div>

      {activeTab === "decisions" && (
        <>
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
            />
          )}
        </>
      )}

      {activeTab === "pending" &&
        (isLoading ? (
          <DecisionsSkeleton />
        ) : (
          <FindingsTable
            findings={findingsData?.findings ?? []}
            analyzedIds={analyzedIds}
            onRowClick={setSelectedFinding}
          />
        ))}

      {activeTab === "analyzed" && (
        <AIDecisionsTable decisions={aiDecisions} onRowClick={setSelectedAIDecision} />
      )}

      {selectedDecisionId && (
        <DecisionDetailPanel
          decisionId={selectedDecisionId}
          onClose={() => setSelectedDecisionId(null)}
        />
      )}

      {selectedFinding && (
        <FindingSidePanel
          finding={selectedFinding}
          isAnalyzed={analyzedIds.includes(selectedFinding.id)}
          isPending={isPending}
          isHealthError={isHealthError}
          onAnalyze={() => handleAnalyzeSingle(selectedFinding)}
          onClose={() => setSelectedFinding(null)}
        />
      )}

      {selectedAIDecision && (
        <AIDecisionSidePanel decision={selectedAIDecision} onClose={() => setSelectedAIDecision(null)} />
      )}
    </div>
  );
};

export default ViewDecisions;
