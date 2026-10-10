import { platformApi } from "@/lib/platform-axios";
import type { DashboardData, KpiCard } from "@/types/dashboard.types";
import type {
  DashboardKpiCardId,
  DashboardOverviewResponse,
} from "@/types/platform/dashboard-api.types";

interface CardMeta {
  label: string;
  icon: string;
  color: string;
  unit: string;
}

const CARD_META: Record<DashboardKpiCardId, CardMeta> = {
  "security-decision": { label: "Security Decision", icon: "shield", color: "green", unit: "percent" },
  "business-risk": { label: "Business Risk", icon: "alert-triangle", color: "amber", unit: "percent" },
  "organization-health": {
    label: "Organization Health",
    icon: "heart-rate-monitor",
    color: "blue",
    unit: "percent",
  },
  findings: { label: "Findings", icon: "brain", color: "purple", unit: "count" },
  events: { label: "Events", icon: "activity", color: "teal", unit: "count" },
  decisions: { label: "Decisions", icon: "trending-up", color: "blue", unit: "count" },
  assets: { label: "Assets", icon: "server", color: "green", unit: "count" },
  "active-api-keys": { label: "Active API Keys", icon: "api", color: "pink", unit: "count" },
};

export const getDashboard = async (): Promise<DashboardData> => {
  const res = await platformApi.get<DashboardOverviewResponse>("/dashboard/overview", {
    params: { days: 14 },
  });

  const { timestamp, organization, stats, cards } = res.data;

  const kpiCards: KpiCard[] = cards.map((card) => ({
    ...card,
    ...CARD_META[card.id],
    lastUpdated: timestamp,
  }));

  return {
    organization: {
      name: organization.name,
      industry: "",
      plan: organization.plan,
      planExpiry: "",
      users: organization.users,
      assets: organization.assets,
      domains: 0,
      apiKeys: organization.apiKeys,
    },
    securitySummary: {
      securityScore: stats.securityScore,
      totalAssets: stats.totalAssets,
      activeAPIs: stats.activeApiKeys,
      apiRequestsToday: stats.apiRequestsToday,
      activeRisks: stats.activeRisks,
      pendingDecisions: stats.pendingDecisions,
      lastUpdated: timestamp,
    },
    kpiCards,
  };
};
