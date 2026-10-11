export interface DailyRiskSnapshotPoint {
  snapshotDate: string;
  totalRisks: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  avgRiskScore: number;
  maxRiskScore: number;
  minRiskScore: number;
}

import type { DecisionStatus, RiskTier } from "@/types/platform/decision-api.types";

export interface DecisionTrendRow {
  date: string;
  status: DecisionStatus;
  count: number;
}

export interface ApiUsageRow {
  date: string;
  count: number;
}

export interface SecurityScoreSnapshotPoint {
  snapshotDate: string;
  securityDecisionScore: number;
  securityDecisionBreakdown: {
    slaComplianceRate: number;
    criticalRemediationRate: number;
    normalizedBacklogRatio: number;
    controlEffectivenessRate: number;
  };
}

export interface RiskDistributionRow {
  tier: RiskTier;
  count: number;
  avgScore: number;
}

export interface AssetCategoryRow {
  category: string;
  count: number;
}

export interface ThreatCategoryRow {
  category: string;
  count: number;
  avgConfidence: number;
}

export interface DailyDecisionRow {
  date: string;
  count: number;
}
