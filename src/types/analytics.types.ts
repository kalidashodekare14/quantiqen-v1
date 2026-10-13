export interface RiskTrendPoint {
  date: string;
  riskScore: number;
  threats: number;
}

export interface DecisionTrendPoint {
  date: string;
  decisions: number;
  resolved: number;
  open: number;
}

export interface ApiUsagePoint {
  date: string;
  requests: number;
}

export interface RiskDistributionPoint {
  name: string;
  value: number;
}

export interface AssetCategoryPoint {
  name: string;
  value: number;
}

export interface SecurityScorePoint {
  date: string;
  score: number;
}

export interface DailyDecisionPoint {
  day: string;
  count: number;
}

export interface ThreatDistributionPoint {
  name: string;
  value: number;
}

export type SectionStatus = "ok" | "error";

export type SectionResult<T> = { status: "ok"; data: T } | { status: "error" };

export interface AnalyticsResult {
  riskTrend: SectionResult<RiskTrendPoint[]>;
  decisionTrend: SectionResult<DecisionTrendPoint[]>;
  apiUsage: SectionResult<ApiUsagePoint[]>;
  riskDistribution: SectionResult<RiskDistributionPoint[]>;
  assetsByCategory: SectionResult<AssetCategoryPoint[]>;
  securityScoreTimeline: SectionResult<SecurityScorePoint[]>;
  dailyDecisionCount: SectionResult<DailyDecisionPoint[]>;
  threatDistribution: SectionResult<ThreatDistributionPoint[]>;
}
