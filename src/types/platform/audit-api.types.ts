export interface PlatformAuditLogEntry {
  id: string;
  organizationId: string;
  action: string;
  actorUserId: string;
  actorRole: string;
  resourceType: string;
  resourceId: string;
  beforeJson: Record<string, unknown>;
  afterJson: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  correlationId: string;
  requestId: string;
  hash: string;
  createdAt: string;
}

export interface PlatformAuditLogResponse {
  data: PlatformAuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface PlatformAuditLogParams {
  action?: string;
  resourceType?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
