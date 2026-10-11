import { apiUsageService } from "@/services/api-usage.service";
import { platformApi } from "@/lib/platform-axios";
import type {
  AnalyticsResult,
  ApiUsagePoint,
  AssetCategoryPoint,
  DailyDecisionPoint,
  DecisionTrendPoint,
  RiskDistributionPoint,
  RiskTrendPoint,
  SectionResult,
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
import type { DecisionStatus } from "@/types/platform/decision-api.types";

const RESOLVED_STATUSES: ReadonlySet<DecisionStatus> = new Set<DecisionStatus>([
  "RESOLVED",
  "REJECTED",
  "EXPIRED",
  "VERIFIED",
]);

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

function toSection<S, U>(result: PromiseSettledResult<S>, map: (value: S) => U): SectionResult<U> {
  if (result.status === "fulfilled") {
    return { status: "ok", data: map(result.value) };
  }
  return { status: "error" };
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
    const entry = byDate.get(date) ?? { date, decisions: 0, resolved: 0, open: 0 };
    entry.decisions += row.count;
    if (RESOLVED_STATUSES.has(row.status)) {
      entry.resolved += row.count;
    } else {
      entry.open += row.count;
    }
    byDate.set(date, entry);
  });

  return Array.from(byDate.values());
}

function mapApiUsage(rows: ApiUsageRow[], days: number): ApiUsagePoint[] {
  return rows.slice(-days).map((row) => ({
    date: shortDate(row.date),
    requests: row.count,
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

export const analyticsService = async (days: number): Promise<AnalyticsResult> => {
  const [
    riskTrendRes,
    decisionTrendRes,
    apiUsageRes,
    riskDistRes,
    assetCatRes,
    scoreRes,
    dailyRes,
    threatRes,
  ] = await Promise.allSettled([
    platformApi.get<DailyRiskSnapshotPoint[]>("/analytics/risk-trend", { params: { days } }),
    platformApi.get<DecisionTrendRow[]>("/analytics/decision-trend", { params: { days } }),
    apiUsageService.getDailyUsage(),
    platformApi.get<RiskDistributionRow[]>("/analytics/risk-distribution"),
    platformApi.get<AssetCategoryRow[]>("/analytics/assets-by-category", {
      params: { groupBy: "assetType" },
    }),
    platformApi.get<SecurityScoreSnapshotPoint[]>("/analytics/security-score-timeline", {
      params: { days },
    }),
    platformApi.get<DailyDecisionRow[]>("/analytics/daily-decision-count", {
      params: { days },
    }),
    platformApi.get<ThreatCategoryRow[]>("/analytics/threat-distribution"),
  ]);

  const result: AnalyticsResult = {
    riskTrend: toSection(riskTrendRes, (res) => mapRiskTrend(res.data)),
    decisionTrend: toSection(decisionTrendRes, (res) => mapDecisionTrend(res.data)),
    apiUsage: toSection(apiUsageRes, (rows) => mapApiUsage(rows, days)),
    riskDistribution: toSection(riskDistRes, (res) => mapRiskDistribution(res.data)),
    assetsByCategory: toSection(assetCatRes, (res) => mapAssetCategories(res.data)),
    securityScoreTimeline: toSection(scoreRes, (res) => mapSecurityScore(res.data)),
    dailyDecisionCount: toSection(dailyRes, (res) => mapDailyDecisions(res.data)),
    threatDistribution: toSection(threatRes, (res) => mapThreatDistribution(res.data)),
  };

  const allFailed = Object.values(result).every((section) => section.status === "error");
  if (allFailed) {
    throw new Error("All analytics endpoints failed");
  }

  return result;
};
