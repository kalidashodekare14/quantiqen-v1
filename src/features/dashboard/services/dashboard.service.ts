import { platformApi } from "@/lib/platform-axios";
import { getPlatformOrganization } from "@/services/organization.service";
import type { DashboardData, KpiCard } from "@/types/dashboard.types";
import type { PaginatedA } from "@/types/api.types";
import type { ApiKey } from "@/types/platform/api-key.types";
import type { DashboardSummaryResponse } from "@/types/platform/dashboard-api.types";
import type { ApiUsageRow, SecurityScoreSnapshotPoint } from "@/types/platform/analytics-api.types";

function buildSparkline(points: SecurityScoreSnapshotPoint[]): number[] {
  return points.slice(-14).map((point) => point.securityDecisionScore);
}

function buildSecurityCard(
  summary: DashboardSummaryResponse,
  timeline: SecurityScoreSnapshotPoint[],
): Pick<KpiCard, "percentageChange" | "trend" | "sparkline"> {
  const sparkline = buildSparkline(timeline);
  if (sparkline.length < 2) {
    return { percentageChange: null, trend: "stable", sparkline };
  }

  const first = sparkline[0];
  const last = sparkline[sparkline.length - 1];
  const change = first === 0 ? 0 : Math.round(((last - first) / first) * 100);

  return {
    percentageChange: change,
    trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
    sparkline,
  };
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
      params: { days: 14 },
    }),
  ]);

  const summary = summaryRes.data;
  const activeApiKeys = apiKeysRes.data.filter((key) => key.status === "ACTIVE").length;
  const requestsToday = usageRes.data.length > 0 ? usageRes.data[usageRes.data.length - 1].count : 0;
  const securityTrend = buildSecurityCard(summary, timelineRes.data);
  const timestamp = summary.timestamp;

  const kpiCards: KpiCard[] = [
    {
      id: "security-decision",
      label: "Security Decision",
      value: summary.scores.securityDecision.score,
      unit: "percent",
      ...securityTrend,
      icon: "shield",
      color: "green",
      lastUpdated: timestamp,
    },
    {
      id: "business-risk",
      label: "Business Risk",
      value: summary.scores.businessRisk.score,
      unit: "percent",
      percentageChange: null,
      trend: "stable",
      sparkline: [],
      icon: "alert-triangle",
      color: "amber",
      lastUpdated: timestamp,
    },
    {
      id: "organization-health",
      label: "Organization Health",
      value: summary.scores.organizationHealth.score,
      unit: "percent",
      percentageChange: null,
      trend: "stable",
      sparkline: [],
      icon: "heart-rate-monitor",
      color: "blue",
      lastUpdated: timestamp,
    },
    {
      id: "findings",
      label: "Findings",
      value: summary.counts.findings,
      unit: "count",
      percentageChange: null,
      trend: "stable",
      sparkline: [],
      icon: "brain",
      color: "purple",
      lastUpdated: timestamp,
    },
    {
      id: "events",
      label: "Events",
      value: summary.counts.events,
      unit: "count",
      percentageChange: null,
      trend: "stable",
      sparkline: [],
      icon: "activity",
      color: "teal",
      lastUpdated: timestamp,
    },
    {
      id: "decisions",
      label: "Decisions",
      value: summary.counts.decisions,
      unit: "count",
      percentageChange: null,
      trend: "stable",
      sparkline: [],
      icon: "trending-up",
      color: "blue",
      lastUpdated: timestamp,
    },
    {
      id: "assets",
      label: "Assets",
      value: summary.counts.assets,
      unit: "count",
      percentageChange: null,
      trend: "stable",
      sparkline: [],
      icon: "server",
      color: "green",
      lastUpdated: timestamp,
    },
    {
      id: "api-keys",
      label: "Active API Keys",
      value: activeApiKeys,
      unit: "count",
      percentageChange: null,
      trend: "stable",
      sparkline: [],
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
