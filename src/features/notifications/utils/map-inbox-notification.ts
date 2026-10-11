import { routes } from "@/constants/routes";
import type {
  NotificationLog,
  NotificationType,
} from "@/types/platform/notification-api.types";
import type { InboxNotification } from "@/types/notification.types";
import type { EventSeverity } from "@/types/severity.types";

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  CRITICAL_RISK_DETECTED: "Critical Risk",
  NEW_DECISION_READY: "New Decision",
  CRITICAL_ASSET_EXPOSURE: "Asset Exposure",
  API_USAGE_WARNING: "API Usage",
  INTEGRATION_FAILURE: "Integration",
  SCAN_COMPLETED: "Scan",
  SUBSCRIPTION_WARNING: "Subscription",
  REMEDIATION_SUBMITTED: "Remediation",
  DECISION_SLA_BREACHED: "SLA Breach",
  VERIFICATION_COMPLETED: "Verification",
};

export const NOTIFICATION_TYPE_TITLES: Record<NotificationType, string> = {
  CRITICAL_RISK_DETECTED: "Critical Risk Detected",
  NEW_DECISION_READY: "New Decision Ready",
  CRITICAL_ASSET_EXPOSURE: "Critical Asset Exposure",
  API_USAGE_WARNING: "API Usage Warning",
  INTEGRATION_FAILURE: "Integration Failure",
  SCAN_COMPLETED: "Scan Completed",
  SUBSCRIPTION_WARNING: "Subscription Warning",
  REMEDIATION_SUBMITTED: "Remediation Submitted",
  DECISION_SLA_BREACHED: "Decision SLA Breached",
  VERIFICATION_COMPLETED: "Verification Completed",
};

const NOTIFICATION_TYPE_SEVERITY: Record<NotificationType, EventSeverity> = {
  CRITICAL_RISK_DETECTED: "critical",
  NEW_DECISION_READY: "success",
  CRITICAL_ASSET_EXPOSURE: "critical",
  API_USAGE_WARNING: "warning",
  INTEGRATION_FAILURE: "warning",
  SCAN_COMPLETED: "info",
  SUBSCRIPTION_WARNING: "warning",
  REMEDIATION_SUBMITTED: "info",
  DECISION_SLA_BREACHED: "critical",
  VERIFICATION_COMPLETED: "success",
};

const NOTIFICATION_TYPE_LINK: Record<NotificationType, string> = {
  CRITICAL_RISK_DETECTED: routes.monitoring,
  NEW_DECISION_READY: routes.decisionCenter,
  CRITICAL_ASSET_EXPOSURE: routes.assets,
  API_USAGE_WARNING: routes.apiManagement,
  INTEGRATION_FAILURE: routes.settings,
  SCAN_COMPLETED: routes.scans,
  SUBSCRIPTION_WARNING: routes.settings,
  REMEDIATION_SUBMITTED: routes.decisionCenter,
  DECISION_SLA_BREACHED: routes.decisionCenter,
  VERIFICATION_COMPLETED: routes.decisionCenter,
};

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const asNumber = (value: unknown): string | null =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : null;

const readValue = (payload: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const found = asString(payload[key]) ?? asNumber(payload[key]);
    if (found) return found;
  }
  return null;
};

const renderValue = (value: unknown): string => {
  if (value === null) return "null";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const fallbackMessage = (payload: Record<string, unknown>): string => {
  const entries = Object.entries(payload).slice(0, 4);
  if (entries.length === 0) return "No additional details.";

  const rendered = entries
    .map(([key, value]) => `${key}: ${renderValue(value)}`)
    .join(" · ");
  const truncated = rendered.length > 180 ? `${rendered.slice(0, 177)}...` : rendered;
  return `Details — ${truncated}`;
};

const buildMessage = (
  type: NotificationType,
  payload: Record<string, unknown>,
): string => {
  const findingId = readValue(payload, ["findingId"]);
  const assetId = readValue(payload, ["assetId", "hostname", "identifier"]);
  const decisionId = readValue(payload, ["decisionId"]);

  switch (type) {
    case "CRITICAL_RISK_DETECTED": {
      const riskScore = readValue(payload, ["riskScore", "score"]);
      const tier = readValue(payload, ["tier", "newTier"]);
      const previousTier = readValue(payload, ["previousTier"]);
      const parts = [
        riskScore ? `Risk score ${riskScore}` : null,
        tier && previousTier ? `tier ${previousTier} → ${tier}` : tier ? `tier ${tier}` : null,
        findingId ? `finding ${findingId}` : null,
      ].filter((part): part is string => part !== null);
      return parts.length > 0 ? `${parts.join(" · ")}.` : fallbackMessage(payload);
    }
    case "NEW_DECISION_READY":
      return decisionId
        ? `Decision ${decisionId} is ready for review.`
        : "A new decision is ready for review.";
    case "CRITICAL_ASSET_EXPOSURE":
      return assetId ? `Exposed asset ${assetId} requires attention.` : fallbackMessage(payload);
    case "API_USAGE_WARNING": {
      const usage = readValue(payload, ["usedPercent", "usagePercent", "percent"]);
      return usage ? `API usage reached ${usage}%.` : fallbackMessage(payload);
    }
    case "INTEGRATION_FAILURE": {
      const integration = readValue(payload, ["integration", "provider", "channel"]);
      const error = readValue(payload, ["error", "errorMessage", "reason"]);
      if (integration && error) return `${integration} failed: ${error}`;
      if (integration) return `${integration} reported a failure.`;
      return fallbackMessage(payload);
    }
    case "SCAN_COMPLETED": {
      const hostname = readValue(payload, ["hostname", "target"]);
      const checks = readValue(payload, ["checks"]);
      const highFindings = readValue(payload, ["highFindings"]);
      const parts = [
        hostname ? `Scan of ${hostname}` : "Scan",
        checks ? `${checks} checks` : null,
        highFindings ? `${highFindings} high findings` : null,
      ].filter((part): part is string => part !== null);
      return `${parts.join(" · ")}.`;
    }
    case "SUBSCRIPTION_WARNING": {
      const plan = readValue(payload, ["plan", "planTier"]);
      const expiry = readValue(payload, ["expiresAt", "expiryDate", "renewalDate"]);
      if (plan && expiry) return `${plan} subscription expires ${expiry}.`;
      if (plan) return `${plan} subscription requires renewal.`;
      return fallbackMessage(payload);
    }
    case "REMEDIATION_SUBMITTED":
      return decisionId
        ? `Remediation submitted for decision ${decisionId}.`
        : "A remediation has been submitted.";
    case "DECISION_SLA_BREACHED": {
      const sla = readValue(payload, ["slaHours", "sla", "breachHours"]);
      if (decisionId && sla) return `Decision ${decisionId} breached its ${sla} SLA.`;
      if (decisionId) return `Decision ${decisionId} breached its SLA.`;
      return "A decision breached its SLA.";
    }
    case "VERIFICATION_COMPLETED": {
      const result = readValue(payload, ["result", "status", "outcome"]);
      if (decisionId && result) return `Verification of ${decisionId} completed: ${result}.`;
      return "A verification has completed.";
    }
  }
};

export const mapInboxNotification = (log: NotificationLog): InboxNotification => ({
  id: log.id,
  type: log.notificationType,
  label: NOTIFICATION_TYPE_LABELS[log.notificationType],
  title: NOTIFICATION_TYPE_TITLES[log.notificationType],
  message: buildMessage(log.notificationType, log.payload),
  severity: NOTIFICATION_TYPE_SEVERITY[log.notificationType],
  stream: log.stream,
  read: log.readAt !== null,
  link: NOTIFICATION_TYPE_LINK[log.notificationType],
  createdAt: log.createdAt,
});
