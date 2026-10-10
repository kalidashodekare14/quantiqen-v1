import { platformApi } from "@/lib/platform-axios";
import { getPlatformOrganization } from "@/services/organization.service";
import type { DashboardData, KpiCard } from "@/types/dashboard.types";
import type { PaginatedA } from "@/types/api.types";
import type { ApiKey } from "@/types/platform/api-key.types";
import type { PlatformAsset } from "@/types/platform/asset-api.types";
import type { DashboardSummaryResponse } from "@/types/platform/dashboard-api.types";
import type {
  ApiUsageRow,
  DailyDecisionRow,
  DailyRiskSnapshotPoint,
  RiskDistributionRow,
  SecurityScoreSnapshotPoint,
  ThreatCategoryRow,
} from "@/types/platform/analytics-api.types";

type Spark = Pick<KpiCard, "percentageChange" | "trend" | "sparkline">;

function toSpark(values: number[]): Spark {
  const sparkline = values.slice(-14);
  if (sparkline.length < 2) {
    return { percentageChange: 0, trend: "stable", sparkline };
  }

  const last = sparkline[sparkline.length - 1];
  const prev = sparkline[sparkline.length - 2];
  let change: number;

  if (prev !== 0 || last !== 0) {
    change = prev === 0 ? 100 : Math.round(((last - prev) / prev) * 100);
  } else {
    const active = sparkline.filter((value) => value > 0);
    const activePrev = active[active.length - 2];
    const activeLast = active[active.length - 1];
    change =
      active.length < 2 || activePrev === 0
        ? 0
        : Math.round(((activeLast - activePrev) / activePrev) * 100);
  }

  return {
    percentageChange: change,
    trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
    sparkline,
  };
}

function toDistribution(values: number[]): Spark {
  return { percentageChange: 0, trend: "stable", sparkline: values };
}

function breakdownToDistribution(breakdown: object): Spark {
  return toDistribution(
    Object.values(breakdown).map((value) => (typeof value === "number" ? Math.round(value * 100) : 0)),
  );
}

function fallbackToSingle(value: number, spark: Spark): Spark {
  if (spark.sparkline.some((point) => point > 0)) {
    return spark;
  }
  return { percentageChange: 0, trend: "stable", sparkline: [value] };
}

function buildWeeklyCreationBuckets(
  items: Array<{ createdAt: string }>,
  weeks = 7,
): number[] {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const buckets = new Array<number>(weeks).fill(0);

  for (const item of items) {
    const weeksAgo = Math.floor((now - new Date(item.createdAt).getTime()) / weekMs);
    if (weeksAgo >= 0 && weeksAgo < weeks) {
      buckets[weeks - 1 - weeksAgo] += 1;
    }
  }

  return buckets;
}

export const getDashboard = async (): Promise<DashboardData> => {
  const [
    summaryRes,
    organization,
    usersRes,
    apiKeysRes,
    pendingRes,
    usageRes,
    timelineRes,
    riskTrendRes,
    dailyDecisionsRes,
    threatsRes,
    assetsRes,
    riskDistributionRes,
  ] = await Promise.all([
    platformApi.get<DashboardSummaryResponse>("/dashboard/summary"),
    getPlatformOrganization(),
    platformApi.get<unknown[]>("/users"),
    platformApi.get<ApiKey[]>("/api-keys"),
    platformApi.get<PaginatedA<unknown, "decisions">>("/decisions", {
      params: { status: "PENDING", limit: 1 },
    }),
    platformApi.get<ApiUsageRow[]>("/analytics/api-usage", { params: { period: "day" } }),
    platformApi.get<SecurityScoreSnapshotPoint[]>("/analytics/security-score-timeline", {
      params: { days: 30 },
    }),
    platformApi.get<DailyRiskSnapshotPoint[]>("/analytics/risk-trend", { params: { days: 30 } }),
    platformApi.get<DailyDecisionRow[]>("/analytics/daily-decision-count", {
      params: { days: 30 },
    }),
    platformApi.get<ThreatCategoryRow[]>("/analytics/threat-distribution"),
    platformApi.get<PlatformAsset[]>("/assets"),
    platformApi.get<RiskDistributionRow[]>("/analytics/risk-distribution"),
  ]);

  const summary = summaryRes.data;
  const activeApiKeys = apiKeysRes.data.filter((key) => key.status === "ACTIVE").length;
  const requestsToday = usageRes.data.length > 0 ? usageRes.data[usageRes.data.length - 1].count : 0;
  const timestamp = summary.timestamp;

  const securitySpark =
    timelineRes.data.length > 0
      ? toSpark(timelineRes.data.map((point) => point.securityDecisionScore))
      : breakdownToDistribution(summary.scores.securityDecision.breakdown);
  const businessRiskSpark =
    riskTrendRes.data.length > 0
      ? toSpark(riskTrendRes.data.map((point) => point.avgRiskScore))
      : breakdownToDistribution(summary.scores.businessRisk.breakdown);
  const findingsSpark =
    threatsRes.data.length > 0
      ? toDistribution(threatsRes.data.map((row) => row.count))
      : toDistribution(riskDistributionRes.data.map((row) => row.count));
  const eventsSpark = fallbackToSingle(
    summary.counts.events,
    toSpark(usageRes.data.map((row) => row.count)),
  );
  const decisionsSpark = fallbackToSingle(
    summary.counts.decisions,
    toSpark(dailyDecisionsRes.data.map((row) => row.count)),
  );
  const assetsSpark = toSpark(buildWeeklyCreationBuckets(assetsRes.data));
  const apiKeySpark = fallbackToSingle(
    activeApiKeys,
    toSpark(buildWeeklyCreationBuckets(apiKeysRes.data)),
  );

  console.info("[dashboard] kpi series lengths", {
    securityDecision: timelineRes.data.length,
    businessRisk: riskTrendRes.data.length,
    orgHealthBreakdown: Object.keys(summary.scores.organizationHealth.breakdown).length,
    findingsThreats: threatsRes.data.length,
    findingsRiskFallback: riskDistributionRes.data.length,
    events: usageRes.data.length,
    decisions: dailyDecisionsRes.data.length,
    assets: assetsRes.data.length,
    apiKeys: apiKeysRes.data.length,
  });

  const kpiCards: KpiCard[] = [
    {
      id: "security-decision",
      label: "Security Decision",
      value: summary.scores.securityDecision.score,
      unit: "percent",
      ...securitySpark,
      icon: "shield",
      color: "green",
      lastUpdated: timestamp,
    },
    {
      id: "business-risk",
      label: "Business Risk",
      value: summary.scores.businessRisk.score,
      unit: "percent",
      ...businessRiskSpark,
      icon: "alert-triangle",
      color: "amber",
      lastUpdated: timestamp,
    },
    {
      id: "organization-health",
      label: "Organization Health",
      value: summary.scores.organizationHealth.score,
      unit: "percent",
      ...breakdownToDistribution(summary.scores.organizationHealth.breakdown),
      icon: "heart-rate-monitor",
      color: "blue",
      lastUpdated: timestamp,
    },
    {
      id: "findings",
      label: "Findings",
      value: summary.counts.findings,
      unit: "count",
      ...findingsSpark,
      icon: "brain",
      color: "purple",
      lastUpdated: timestamp,
    },
    {
      id: "events",
      label: "Events",
      value: summary.counts.events,
      unit: "count",
      ...eventsSpark,
      icon: "activity",
      color: "teal",
      lastUpdated: timestamp,
    },
    {
      id: "decisions",
      label: "Decisions",
      value: summary.counts.decisions,
      unit: "count",
      ...decisionsSpark,
      icon: "trending-up",
      color: "blue",
      lastUpdated: timestamp,
    },
    {
      id: "assets",
      label: "Assets",
      value: summary.counts.assets,
      unit: "count",
      ...assetsSpark,
      icon: "server",
      color: "green",
      lastUpdated: timestamp,
    },
    {
      id: "api-keys",
      label: "Active API Keys",
      value: activeApiKeys,
      unit: "count",
      ...apiKeySpark,
      icon: "api",
      color: "pink",
      lastUpdated: timestamp,
    },
  ];

  return {
    organization: {
      name: organization.orgName,
      industry: "",
      plan: organization.planTier,
      planExpiry: "",
      users: Array.isArray(usersRes.data) ? usersRes.data.length : 0,
      assets: summary.counts.assets,
      domains: 0,
      apiKeys: apiKeysRes.data.length,
    },
    securitySummary: {
      securityScore: summary.scores.securityDecision.score,
      totalAssets: summary.counts.assets,
      activeAPIs: activeApiKeys,
      apiRequestsToday: requestsToday,
      activeRisks: summary.counts.risks,
      pendingDecisions: pendingRes.data.total ?? 0,
      lastUpdated: timestamp,
    },
    kpiCards,
  };
};
