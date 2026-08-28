export interface AuditLogEntry {
  id: string;
  actorType: string;
  actorUserId: string;
  action: string;
  resource: string;
  outcome: string;
  reason: string | null;
  ipAddr: string;
  createdAt: string;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditLogParams {
  action?: string;
  outcome?: string;
  limit?: number;
  offset?: number;
}
