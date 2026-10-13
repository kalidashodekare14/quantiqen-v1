export type EventSeverity = "info" | "success" | "warning" | "critical";

export interface MonitoringEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: EventSeverity;
  asset?: string;
}

export interface MonitoringStats {
  apiRequests: number;
  assets: number;
  decisions: number;
  risks: number;
  events: number;
  findings: number;
}

export interface MonitoringData {
  lastUpdated: string;
  stats: MonitoringStats;
  events: MonitoringEvent[];
}
