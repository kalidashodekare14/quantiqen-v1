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
import DecisionSidePanel from "./components/DecisionSidePanel";
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
  const [aiDecisions, setAIDecisions] = useState<AIDecisionItem[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<AIDecisionItem | null>(null);

  const { data: findingsData, isLoading: findingsLoading } = useFindings();
  const { isError: isHealthError } = useHealthCheck();
  const { mutate, isPending } = useAIDecision();

  const handleAnalyzeSingle = (finding: Finding) => {
    mutate(buildPayload([finding]), {
      onSuccess: (data) => {
        setAIDecisions((prev) => [...prev, ...data.decisions]);
      },
    });
  };

  const handleBatchAnalyze = () => {
    const findingsToAnalyze = findingsData?.findings ?? [];
    mutate(buildPayload(findingsToAnalyze), {
      onSuccess: (data) => {
        setAIDecisions(data.decisions);
      },
    });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <HealthBanner />

      <PageHeader
        title="Decision Center"
        action={
          <AppButton
            variant="primary"
            size="md"
            disabled={isPending || isHealthError}
            loading={isPending}
            onClick={handleBatchAnalyze}
          >
            Run AI Analysis
          </AppButton>
        }
      />

      {findingsLoading ? (
        <DecisionsSkeleton />
      ) : (
        <>
          <FindingsTable
            findings={findingsData?.findings ?? []}
            onAnalyzeSingle={handleAnalyzeSingle}
            isAnalyzing={isPending}
          />

          <AIDecisionsTable
            decisions={aiDecisions}
            onRowClick={setSelectedDecision}
            findings={findingsData?.findings}
            generatedAt={new Date().toISOString()}
          />
        </>
      )}

      <DecisionSidePanel
        decision={selectedDecision}
        onClose={() => setSelectedDecision(null)}
        findings={findingsData?.findings}
      />
    </div>
  );
};

export default ViewDecisions;
