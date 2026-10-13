export interface DashboardCounts {
  events: number;
  findings: number;
  risks: number;
  decisions: number;
  assets: number;
}

export interface SecurityDecisionBreakdown {
  slaComplianceRate: number;
  criticalRemediationRate: number;
  normalizedBacklogRatio: number;
  controlEffectivenessRate: number;
}

export interface BusinessRiskBreakdown {
  technicalRiskScore: number;
  assetCriticalityWeight: number;
  dataSensitivityWeight: number;
  internetExposureWeight: number;
  customerImpactWeight: number;
  regulatoryImpactWeight: number;
}

export interface OrganizationHealthBreakdown {
  securityPosture: number;
  assetCoverage: number;
  decisionSlaPerformance: number;
  telemetryHealth: number;
  integrationCoverage: number;
}

export interface ScoreCard<TBreakdown> {
  score: number;
  breakdown: TBreakdown;
}

export interface DashboardScores {
  securityDecision: ScoreCard<SecurityDecisionBreakdown>;
  businessRisk: ScoreCard<BusinessRiskBreakdown>;
  organizationHealth: ScoreCard<OrganizationHealthBreakdown>;
}

export interface DashboardSummaryResponse {
  counts: DashboardCounts;
  scores: DashboardScores;
  timestamp: string;
}

export type DashboardKpiCardId =
  | "security-decision"
  | "business-risk"
  | "organization-health"
  | "findings"
  | "events"
  | "decisions"
  | "assets"
  | "active-api-keys";

export interface DashboardKpiCard {
  id: DashboardKpiCardId;
  value: number;
  percentageChange: number;
  trend: "up" | "down" | "stable";
  sparkline: number[];
}

export interface DashboardOverviewOrganization {
  name: string;
  plan: string;
  users: number;
  assets: number;
  apiKeys: number;
}

export interface DashboardOverviewStats {
  securityScore: number;
  totalAssets: number;
  activeApiKeys: number;
  apiRequestsToday: number;
  activeRisks: number;
  pendingDecisions: number;
}

export interface DashboardOverviewResponse {
  timestamp: string;
  organization: DashboardOverviewOrganization;
  stats: DashboardOverviewStats;
  cards: DashboardKpiCard[];
}
