"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import AppButton from "@/components/shared/AppButton";
import { useFindings } from "./hooks/useFindings";
import { useHealthCheck } from "./hooks/useHealthCheck";
import { useAIDecision } from "./hooks/useAIDecision";
import type { AIDecisionItem, AIDecisionRequest } from "@/types/ai-engine.types";
import type { Finding } from "@/types/finding.types";
import FindingsTable from "./components/FindingsTable";
import AIDecisionsTable from "./components/AIDecisionsTable";
import FindingSidePanel from "./components/FindingSidePanel";
import AIDecisionSidePanel from "./components/AIDecisionSidePanel";
import HealthBanner from "./components/HealthBanner";
import DecisionsSkeleton from "./components/DecisionsSkeleton";

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
  const [activeTab, setActiveTab] = useState<"pending" | "analyzed">("pending");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedAIDecision, setSelectedAIDecision] = useState<AIDecisionItem | null>(null);
  const [aiDecisions, setAIDecisions] = useState<AIDecisionItem[]>([]);

  const analyzedIds = aiDecisions.map((d) => d.finding_id);

  const { data: findingsData, isLoading } = useFindings();
  const { isError: isHealthError } = useHealthCheck();
  const { mutate, isPending } = useAIDecision();

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

  const pendingCount =
    findingsData?.findings.filter((f) => !analyzedIds.includes(f.id)).length ?? 0;
  const analyzedCount = aiDecisions.length;

  const tabClass = (tab: "pending" | "analyzed") =>
    `px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
      activeTab === tab
        ? "border-b-2 border-primary text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="flex w-full flex-col gap-6">
      <HealthBanner />

      <PageHeader
        title="Decision Center"
        action={
          <AppButton
            variant="primary"
            size="md"
            disabled={isPending || isHealthError || pendingCount === 0}
            loading={isPending}
            onClick={handleBatchAnalyze}
          >
            Run AI Analysis
          </AppButton>
        }
      />

      <div className="border-foreground/10 mb-4 flex border-b">
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

      {isLoading ? (
        <DecisionsSkeleton />
      ) : activeTab === "pending" ? (
        <FindingsTable
          findings={findingsData?.findings ?? []}
          analyzedIds={analyzedIds}
          onRowClick={setSelectedFinding}
        />
      ) : (
        <AIDecisionsTable decisions={aiDecisions} onRowClick={setSelectedAIDecision} />
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
        <AIDecisionSidePanel
          decision={selectedAIDecision}
          onClose={() => setSelectedAIDecision(null)}
        />
      )}
    </div>
  );
};

export default ViewDecisions;
