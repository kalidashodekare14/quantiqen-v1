export interface StreamEvent {
  id: string;
  organizationId: string;
  type: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export interface MonitoringRecentResponse {
  events: StreamEvent[];
  hasMore: boolean;
  timestamp: string;
}
