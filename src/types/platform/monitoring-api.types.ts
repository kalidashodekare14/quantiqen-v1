export interface StreamEvent {
  id: string;
  organizationId: string;
  type: string;
  payload: Record<string, unknown> | null;
  createdAt?: string;
  timestamp?: string;
  occurredAt?: string;
  receivedAt?: string;
}

export interface MonitoringRecentResponse {
  events: StreamEvent[];
  hasMore: boolean;
  timestamp: string;
}
