export interface DashboardData {
  organization: Organization;
  securitySummary: SecuritySummary;
  kpiCards: KpiCard[];
}

export interface Organization {
  name: string;
  industry: string;
  plan: string;
  planExpiry: string;
  users: number;
  assets: number;
  domains: number;
  apiKeys: number;
}

export interface SecuritySummary {
  securityScore: number;
  totalAssets: number;
  activeAPIs: number;
  apiRequestsToday: number;
  activeRisks: number;
  pendingDecisions: number;
  lastUpdated: string;
}

export interface KpiCard {
  id: string;
  label: string;
  value: number;
  unit: string;
  percentageChange: number | null;
  trend: "up" | "down" | "stable";
  icon: string;
  color: string;
  lastUpdated: string;
  sparkline: number[];
}
