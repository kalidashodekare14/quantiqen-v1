"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { statusBadgeClass, tierBadgeClass } from "../decision-badges";
import { formatDateTime, formatRelativeTime } from "@/utils/date/date";
import { useDecisionDetail } from "../hooks/useDecisions";
import { useUsers } from "@/hooks/use-users";
import { useTeams } from "@/hooks/use-teams";
import DecisionActions from "./decision-panel/DecisionActions";
import NotesSection from "./decision-panel/NotesSection";
import RemediationSection from "./decision-panel/RemediationSection";
import VerificationSection from "./decision-panel/VerificationSection";

interface DecisionDetailPanelProps {
  decisionId: string;
  onClose: () => void;
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-border border-t pt-4">
      <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-card-foreground text-sm">{value ?? "—"}</p>
    </div>
  );
}

const DecisionDetailPanel = ({ decisionId, onClose }: DecisionDetailPanelProps) => {
  const [showEngineVersions, setShowEngineVersions] = useState(false);
  const { data: decision, isLoading, isError, refetch } = useDecisionDetail(decisionId);
  const { data: users } = useUsers();
  const { data: teams } = useTeams();

  const resolveUserName = (id: string) => {
    const user = users?.find((u) => u.id === id);
    return user ? (user.name ?? user.email ?? user.qipUserId) : id;
  };

  const resolveTeamName = (id: string) => {
    const team = teams?.find((t) => t.id === id);
    return team?.name ?? id;
  };

  const drivers = decision ? Object.entries(decision.risk.drivers) : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-40 bg-black"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-card fixed inset-y-0 right-0 z-50 flex w-full flex-col sm:w-140"
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-6 py-5">
          <div className="min-w-0">
            <p className="text-card-foreground truncate text-lg font-semibold">
              {decision?.aiDecisionLabel ?? "Decision"}
            </p>
            <p className="text-muted-foreground mt-0.5 truncate font-mono text-xs">
              {decisionId}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close decision detail"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError || !decision ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-muted-foreground text-sm">Unable to load this decision.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(decision.status)}`}
                >
                  {decision.status.replaceAll("_", " ")}
                </span>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tierBadgeClass(decision.risk.tier)}`}
                >
                  {decision.risk.tier}
                </span>
                <Badge variant="outline">{decision.risk.priority}</Badge>
                <span className="text-muted-foreground ml-auto text-xs">
                  {formatRelativeTime(decision.updatedAt)}
                </span>
              </div>

              <PanelSection title="Finding">
                <p className="text-card-foreground text-sm font-medium">{decision.finding.title}</p>
                <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                  {decision.finding.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{decision.finding.severity}</Badge>
                  <Badge variant="outline">
                    {decision.finding.findingType.replaceAll("_", " ")}
                  </Badge>
                  <Badge variant="outline">{decision.finding.findingSource}</Badge>
                </div>
              </PanelSection>

              <PanelSection title="Risk Analysis">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Risk Score</p>
                    <p className="text-card-foreground mt-1 text-xl font-semibold">
                      {decision.risk.riskScore}
                    </p>
                    <div className="bg-muted-foreground/20 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-destructive h-full rounded-full"
                        style={{ width: `${Math.min(100, decision.risk.riskScore)}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Confidence</p>
                    <p className="text-card-foreground mt-1 text-xl font-semibold">
                      {decision.risk.confidence}%
                    </p>
                    <div className="bg-muted-foreground/20 mt-2 h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-chart-2 h-full rounded-full"
                        style={{ width: `${Math.min(100, decision.risk.confidence)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-card-foreground mt-3 text-sm whitespace-pre-wrap">
                  {decision.risk.aiSummary}
                </p>

                {drivers.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {drivers.map(([name, driver]) => (
                      <div key={name} className="bg-muted/50 rounded-lg p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-card-foreground text-sm font-medium">
                            {name.replaceAll("_", " ")}
                          </span>
                          <span className="text-muted-foreground text-xs">{driver.value}/100</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {driver.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-muted-foreground mt-3 text-xs">{decision.risk.reason}</p>
              </PanelSection>

              {decision.recommendation && (
                <PanelSection title="Recommendation">
                  <p className="text-card-foreground text-sm">
                    {decision.recommendation.technical_text}
                  </p>
                  {decision.recommendation.business_explanation && (
                    <p className="text-muted-foreground mt-1.5 text-sm">
                      {decision.recommendation.business_explanation}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{decision.recommendation.category}</Badge>
                    <Badge variant="outline">{decision.recommendation.priority}</Badge>
                    <Badge variant="outline">
                      Effort: {decision.recommendation.estimated_effort}
                    </Badge>
                    <Badge variant="outline">
                      Risk reduction: {decision.recommendation.risk_reduction_potential}%
                    </Badge>
                  </div>
                </PanelSection>
              )}

              <PanelSection title="Details">
                <div className="grid grid-cols-2 gap-3">
                  <DetailField label="Next action" value={decision.nextAction} />
                  <DetailField label="Estimated fix time" value={decision.estimatedFixTime} />
                  <DetailField label="Expected risk reduction" value={`${decision.expectedRiskReduction}%`} />
                  <DetailField label="Business owner" value={decision.businessOwner} />
                  <DetailField
                    label="Assigned to"
                    value={
                      decision.assignedToUserId
                        ? resolveUserName(decision.assignedToUserId)
                        : "Unassigned"
                    }
                  />
                  <DetailField
                    label="Primary team"
                    value={
                      decision.primaryTeamId
                        ? resolveTeamName(decision.primaryTeamId)
                        : "—"
                    }
                  />
                  <DetailField
                    label="SLA breach at"
                    value={decision.SLABreachAt ? formatDateTime(decision.SLABreachAt) : "—"}
                  />
                  <DetailField
                    label="Approval required"
                    value={decision.approvalRequired ? "Yes" : "No"}
                  />
                  <DetailField label="Situation" value={decision.situationId ?? "—"} />
                </div>

                {decision.rulesTriggered.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {decision.rulesTriggered.map((rule) => (
                      <Badge key={rule} variant="secondary" className="font-mono text-xs">
                        {rule}
                      </Badge>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="text-primary mt-3 flex items-center gap-1 text-xs hover:underline"
                  onClick={() => setShowEngineVersions((value) => !value)}
                >
                  Engine versions
                  {showEngineVersions ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>
                {showEngineVersions && (
                  <pre className="bg-muted/50 text-muted-foreground mt-2 max-h-40 overflow-auto rounded-lg p-3 text-xs">
                    {JSON.stringify(decision.engineVersions, null, 2)}
                  </pre>
                )}
              </PanelSection>

              <PanelSection title="History">
                <div className="flex flex-col gap-2">
                  {decision.history.length === 0 && (
                    <p className="text-muted-foreground text-sm">No history entries.</p>
                  )}
                  {decision.history.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                          entry.fromStatus ? "bg-chart-5" : "bg-chart-2"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-card-foreground">
                          {entry.fromStatus
                            ? `${entry.fromStatus.replaceAll("_", " ")} → `
                            : ""}
                          <span className="font-medium">
                            {entry.toStatus.replaceAll("_", " ")}
                          </span>
                        </p>
                        {entry.note && <p className="text-muted-foreground text-xs">{entry.note}</p>}
                      </div>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {formatRelativeTime(entry.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </PanelSection>

              <PanelSection title="Actions">
                <DecisionActions decision={decision} />
              </PanelSection>

              <PanelSection title="Investigation Notes">
                <NotesSection decisionId={decision.id} />
              </PanelSection>

              <PanelSection title="Remediation">
                <RemediationSection
                  decisionId={decision.id}
                  decisionStatus={decision.status}
                />
              </PanelSection>

              <PanelSection title="Verification">
                <VerificationSection
                  decisionId={decision.id}
                  decisionStatus={decision.status}
                />
              </PanelSection>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DecisionDetailPanel;
