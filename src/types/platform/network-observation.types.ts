export type ObservationType =
  | "PORT_SCAN_DETECTED"
  | "SYN_FLOOD"
  | "ICMP_ANOMALY"
  | "SUSPICIOUS_SOURCE"
  | "SUSPICIOUS_DESTINATION"
  | "TRAFFIC_SPIKE"
  | "REPEATED_CONNECTION_FAILURE"
  | "MALICIOUS_IP_COMMUNICATION"
  | "SENSITIVE_PORT_ACTIVITY"
  | "DATA_EXFILTRATION_INDICATOR";

export type ObservationStatus = "NEW" | "PROMOTED_TO_ALERT" | "CLOSED";

export type PlatformSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface ObservationAssetRef {
  id: string;
  name: string;
  identifier: string;
}

export interface NetworkObservation {
  id: string;
  organizationId: string;
  assetId: string | null;
  observationType: ObservationType;
  severity: PlatformSeverity;
  status: ObservationStatus;
  sourceIp: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
  asset: ObservationAssetRef | null;
}

export interface NetworkObservationListResponse {
  items: NetworkObservation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NetworkObservationDetail extends NetworkObservation {
  details?: Record<string, unknown>;
}

export interface NetworkObservationParams {
  observationType?: ObservationType;
  severity?: PlatformSeverity;
  status?: ObservationStatus;
  assetId?: string;
  sourceIp?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
