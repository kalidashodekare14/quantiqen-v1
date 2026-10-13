export type PlatformState = "HEALTHY" | "DEGRADED" | "UNAVAILABLE" | "RECOVERING";

export type DlqReason =
  | "PROVIDER_UNAVAILABLE"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "TIMEOUT"
  | "ORG_NOT_FOUND"
  | "UNKNOWN_ERROR"
  | "AUTH_FAILURE"
  | "REDIS_UNAVAILABLE";

export type RecoveryPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type IncidentSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type IncidentStatus = "ACTIVE" | "INVESTIGATING" | "RESOLVED" | "MONITORING";

export const DLQ_REASONS: DlqReason[] = [
  "PROVIDER_UNAVAILABLE",
  "RATE_LIMITED",
  "VALIDATION_ERROR",
  "TIMEOUT",
  "ORG_NOT_FOUND",
  "UNKNOWN_ERROR",
  "AUTH_FAILURE",
  "REDIS_UNAVAILABLE",
];

export const RECOVERY_PRIORITIES: RecoveryPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const INCIDENT_SEVERITIES: IncidentSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const INCIDENT_STATUSES: IncidentStatus[] = [
  "ACTIVE",
  "INVESTIGATING",
  "RESOLVED",
  "MONITORING",
];

export const INCIDENT_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  ACTIVE: ["INVESTIGATING", "RESOLVED"],
  INVESTIGATING: ["RESOLVED", "MONITORING"],
  MONITORING: ["RESOLVED", "INVESTIGATING"],
  RESOLVED: [],
};

export interface StatusQueueDetail {
  waiting: number;
  failed: number;
}

export interface StatusResponse {
  overall: string;
  components: {
    database: string;
    redis: string;
    redisPubSub: string;
    redisBullmq: string;
    workers: string;
    queues: Record<string, string>;
    queueDetails: Record<string, StatusQueueDetail>;
    failedJobCount: number;
    scanner: string;
    riskEngine: string;
    realtime: string;
  };
  timestamp: string;
}

export interface HealthProvider {
  provider: string;
  status: string;
  lastCheckedAt: string;
  consecutiveFails: number;
  latencyMs: number;
}

export interface HealthEngine {
  engine: string;
  status: string;
  lastCheckedAt: string;
  consecutiveFails: number;
  isAuthoritative: boolean;
  latencyMs: number;
}

export interface SystemHealthResponse {
  platformState: PlatformState;
  suspensionActive: boolean;
  providers: HealthProvider[];
  engines: HealthEngine[];
  timestamp: string;
}

export interface SuspensionMetrics {
  isActive: boolean;
  triggeredBy: string | null;
  activatedAt: string | null;
  findingsQueued: number;
  findingsProcessed: number;
}

export interface DlqOverview {
  total: number;
  byQueue: Record<string, number>;
  byPriority: Record<RecoveryPriority, number>;
  byReason: Partial<Record<DlqReason, number>>;
  avgAgeMs: number;
  recoveredCount: number;
  totalCount: number;
}

export interface DlqFailure {
  id: string;
  queueName: string;
  jobId: string;
  organizationId: string;
  reasonCode: DlqReason;
  errorMessage: string;
  errorStack: string;
  recoveryPriority: RecoveryPriority;
  recoveryPriorityOrder: number;
  attemptCount: number;
  maxAttempts: number;
  jobPayload: Record<string, unknown>;
  backoffType: string;
  backoffDelay: number;
  failureMetadata: Record<string, unknown>;
  sequenceNumber: number;
  enqueuedAt: string;
  failedAt: string;
  recovered: boolean;
  recoveredAt: string | null;
  createdAt: string;
}

export interface DlqFailuresParams {
  queueName?: string;
  reasonCode?: DlqReason;
  recoveryPriority?: RecoveryPriority;
  recovered?: boolean;
  page?: number;
  limit?: number;
}

export interface DlqFailuresResponse {
  items: DlqFailure[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReplayResponse {
  queued: boolean;
  newJobId?: string;
  skipped?: string;
}

export interface SystemIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedComponents: string[];
  suspensionTriggered: boolean;
  detectedAt: string;
  resolvedAt: string | null;
  monitoringAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  severity: IncidentSeverity;
  affectedComponents: string[];
  suspensionTriggered?: boolean;
}

export interface UpdateIncidentRequest {
  status: IncidentStatus;
  resolutionNotes?: string | null;
}
