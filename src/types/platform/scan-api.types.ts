export type ScanType =
  | "DNS"
  | "TLS"
  | "HTTP_HEADERS"
  | "HOST_DISCOVERY"
  | "PORT_SCAN"
  | "VULNERABILITY";

export type ScanStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type CheckStatus = "PASS" | "FAIL" | "WARNING" | "ERROR" | "TIMEOUT";

export const SCAN_TYPES: ScanType[] = [
  "DNS",
  "TLS",
  "HTTP_HEADERS",
  "HOST_DISCOVERY",
  "PORT_SCAN",
  "VULNERABILITY",
];

export const SCAN_STATUSES: ScanStatus[] = [
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

export interface ScanAssetSummary {
  id: string;
  name: string;
  identifier: string;
  assetType?: string;
}

export interface ScanPolicy {
  id: string;
  organizationId: string;
  assetId: string;
  scanTypes: ScanType[];
  intervalMinutes: number;
  enabled: boolean;
  scanConfig: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ScanPolicyListItem extends ScanPolicy {
  asset: ScanAssetSummary;
}

export interface CreateScanPolicyRequest {
  assetId: string;
  scanTypes: ScanType[];
  intervalMinutes?: number;
  enabled?: boolean;
}

export interface UpdateScanPolicyRequest {
  scanTypes?: ScanType[];
  intervalMinutes?: number;
  enabled?: boolean;
}

export interface ScanJob {
  id: string;
  organizationId: string;
  scanPolicyId: string;
  assetId: string;
  status: ScanStatus;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  asset: ScanAssetSummary;
}

export interface ScanResult {
  id: string;
  organizationId: string;
  scanJobId: string;
  scanType: ScanType;
  checkStatus: CheckStatus;
  rawOutput: Record<string, unknown>;
  summary: string;
  riskLevel: string;
  createdAt: string;
}

export interface ScanJobDetail extends ScanJob {
  results: ScanResult[];
}

export interface TriggerScanRequest {
  assetIds: string[];
}

export interface TriggerScanResponse {
  message: string;
  jobs: Array<{ id: string; status: ScanStatus }>;
}
