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
