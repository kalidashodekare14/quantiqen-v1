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
