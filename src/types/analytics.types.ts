export interface RiskTrendPoint {
  date: string;
  riskScore: number;
  threats: number;
}

export interface DecisionTrendPoint {
  date: string;
  decisions: number;
  resolved: number;
  pending: number;
}

export interface ApiUsagePoint {
  date: string;
  requests: number;
  errors: number;
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

export interface AnalyticsData {
  riskTrend: RiskTrendPoint[];
  decisionTrend: DecisionTrendPoint[];
  apiUsage: ApiUsagePoint[];
  riskDistribution: RiskDistributionPoint[];
  assetsByCategory: AssetCategoryPoint[];
  securityScoreTimeline: SecurityScorePoint[];
  dailyDecisionCount: DailyDecisionPoint[];
  threatDistribution: ThreatDistributionPoint[];
}
