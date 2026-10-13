export type HealthStatus = "HEALTHY" | "DEGRADED" | "UNAVAILABLE";

export interface HealthProvider {
  provider: string;
  status: HealthStatus;
  lastCheckedAt: string;
  consecutiveFails: number;
  latencyMs: number;
}

export interface HealthEngine {
  engine: string;
  status: HealthStatus;
  lastCheckedAt: string;
  consecutiveFails: number;
  isAuthoritative: boolean;
  latencyMs: number;
}

export interface SystemHealth {
  platformState: HealthStatus;
  suspensionActive: boolean;
  providers: HealthProvider[];
  engines: HealthEngine[];
  timestamp: string;
}
