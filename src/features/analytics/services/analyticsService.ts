import { platformApi } from "@/lib/platform-axios";
import type {
  AnalyticsData,
  ApiUsagePoint,
  AssetCategoryPoint,
  DailyDecisionPoint,
  DecisionTrendPoint,
  RiskDistributionPoint,
  RiskTrendPoint,
  SecurityScorePoint,
  ThreatDistributionPoint,
} from "@/types/analytics.types";
import type {
  ApiUsageRow,
  AssetCategoryRow,
  DailyDecisionRow,
  DailyRiskSnapshotPoint,
  DecisionTrendRow,
  RiskDistributionRow,
  SecurityScoreSnapshotPoint,
  ThreatCategoryRow,
} from "@/types/platform/analytics-api.types";

const RESOLVED_STATUSES = new Set(["RESOLVED", "REJECTED", "EXPIRED", "VERIFIED"]);

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapRiskTrend(rows: DailyRiskSnapshotPoint[]): RiskTrendPoint[] {
  return rows.map((row) => ({
    date: shortDate(row.snapshotDate),
    riskScore: row.avgRiskScore,
    threats: row.totalRisks,
  }));
}

function mapDecisionTrend(rows: DecisionTrendRow[]): DecisionTrendPoint[] {
  const byDate = new Map<string, DecisionTrendPoint>();

  rows.forEach((row) => {
    const date = shortDate(row.date);
    const entry = byDate.get(date) ?? { date, decisions: 0, resolved: 0, pending: 0 };
    entry.decisions += row.count;
    if (RESOLVED_STATUSES.has(row.status)) {
      entry.resolved += row.count;
    } else {
      entry.pending += row.count;
    }
    byDate.set(date, entry);
  });

  return Array.from(byDate.values());
}

function mapApiUsage(rows: ApiUsageRow[]): ApiUsagePoint[] {
  return rows.map((row) => ({
    date: shortDate(row.date),
    requests: row.count,
    errors: 0,
  }));
}

function mapRiskDistribution(rows: RiskDistributionRow[]): RiskDistributionPoint[] {
  return rows.map((row) => ({ name: titleCase(row.tier), value: row.count }));
}

function mapAssetCategories(rows: AssetCategoryRow[]): AssetCategoryPoint[] {
  return rows.map((row) => ({ name: titleCase(row.category), value: row.count }));
}

function mapSecurityScore(rows: SecurityScoreSnapshotPoint[]): SecurityScorePoint[] {
  return rows.map((row) => ({
    date: shortDate(row.snapshotDate),
    score: row.securityDecisionScore,
  }));
}

function mapDailyDecisions(rows: DailyDecisionRow[]): DailyDecisionPoint[] {
  return rows.map((row) => ({ day: shortDate(row.date), count: row.count }));
}

function mapThreatDistribution(rows: ThreatCategoryRow[]): ThreatDistributionPoint[] {
  return rows.map((row) => ({ name: titleCase(row.category), value: row.count }));
}

export const analyticsService = async (days: number): Promise<AnalyticsData> => {
  const [riskTrendRes, decisionTrendRes, apiUsageRes, riskDistRes, assetCatRes, scoreRes, dailyRes, threatRes] =
    await Promise.all([
      platformApi.get<DailyRiskSnapshotPoint[]>("/analytics/risk-trend", { params: { days } }),
      platformApi.get<DecisionTrendRow[]>("/analytics/decision-trend", { params: { days } }),
      platformApi.get<ApiUsageRow[]>("/analytics/api-usage", { params: { period: "day" } }),
      platformApi.get<RiskDistributionRow[]>("/analytics/risk-distribution"),
      platformApi.get<AssetCategoryRow[]>("/analytics/assets-by-category", {
        params: { groupBy: "assetType" },
      }),
      platformApi.get<SecurityScoreSnapshotPoint[]>("/analytics/security-score-timeline", {
        params: { days },
      }),
      platformApi.get<DailyDecisionRow[]>("/analytics/daily-decision-count", {
        params: { days: 7 },
      }),
      platformApi.get<ThreatCategoryRow[]>("/analytics/threat-distribution"),
    ]);

  return {
    riskTrend: mapRiskTrend(riskTrendRes.data),
    decisionTrend: mapDecisionTrend(decisionTrendRes.data),
    apiUsage: mapApiUsage(apiUsageRes.data),
    riskDistribution: mapRiskDistribution(riskDistRes.data),
    assetsByCategory: mapAssetCategories(assetCatRes.data),
    securityScoreTimeline: mapSecurityScore(scoreRes.data),
    dailyDecisionCount: mapDailyDecisions(dailyRes.data),
    threatDistribution: mapThreatDistribution(threatRes.data),
  };
};
