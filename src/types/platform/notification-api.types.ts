export type NotificationType =
  | "CRITICAL_RISK_DETECTED"
  | "NEW_DECISION_READY"
  | "CRITICAL_ASSET_EXPOSURE"
  | "API_USAGE_WARNING"
  | "INTEGRATION_FAILURE"
  | "SCAN_COMPLETED"
  | "SUBSCRIPTION_WARNING"
  | "REMEDIATION_SUBMITTED"
  | "DECISION_SLA_BREACHED"
  | "VERIFICATION_COMPLETED";

export type NotificationChannel = "EMAIL" | "SLACK" | "WEBHOOK" | "IN_APP";

export type WebhookDeliveryStatus = "PENDING" | "DELIVERED" | "FAILED" | "RETRYING";

export const NOTIFICATION_TYPES: NotificationType[] = [
  "CRITICAL_RISK_DETECTED",
  "NEW_DECISION_READY",
  "CRITICAL_ASSET_EXPOSURE",
  "API_USAGE_WARNING",
  "INTEGRATION_FAILURE",
  "SCAN_COMPLETED",
  "SUBSCRIPTION_WARNING",
  "REMEDIATION_SUBMITTED",
  "DECISION_SLA_BREACHED",
  "VERIFICATION_COMPLETED",
];

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  "EMAIL",
  "SLACK",
  "WEBHOOK",
  "IN_APP",
];

export const WEBHOOK_DELIVERY_STATUSES: WebhookDeliveryStatus[] = [
  "PENDING",
  "DELIVERED",
  "FAILED",
  "RETRYING",
];

export interface NotificationPreference {
  id: string;
  organizationId: string;
  notificationType: NotificationType;
  channels: NotificationChannel[];
  enabled: boolean;
  emailAddresses: string[];
  slackWebhookUrl: string;
  customWebhookEndpointId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertNotificationPreferenceRequest {
  notificationType: NotificationType;
  channels: NotificationChannel[];
  enabled?: boolean;
  emailAddresses?: string[];
  slackWebhookUrl?: string;
  customWebhookEndpointId?: string;
}

export interface WebhookEndpoint {
  id: string;
  organizationId: string;
  url: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  secret?: string;
}

export interface CreateWebhookRequest {
  url: string;
  secret: string;
  description?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  secret?: string;
  description?: string;
  active?: boolean;
}

export interface WebhookDelivery {
  id: string;
  organizationId: string;
  webhookEndpointId: string;
  notificationType: NotificationType;
  jobId: string;
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  httpStatusCode: number;
  responseBody: string;
  retryCount: number;
  lastAttemptAt: string | null;
  createdAt: string;
}
