export type EventType =
  | "Incoming API Request"
  | "Asset Updated"
  | "Decision Created"
  | "Risk Changed"
  | "Security Event"
  | "Decision Delivered";

export type EventSeverity = "info" | "warning" | "critical" | "success";

export interface MonitoringEvent {
  id: string;
  type: EventType;
  message: string;
  timestamp: string;
  severity: EventSeverity;
  asset?: string;
  organization?: string;
}

export interface MonitoringStats {
  apiRequests: number;
  assetsUpdated: number;
  decisionsCreated: number;
  risksChanged: number;
  securityEvents: number;
  decisionsDelivered: number;
}

export interface MonitoringData {
  lastUpdated: string;
  stats: MonitoringStats;
  events: MonitoringEvent[];
}
