import { platformApi } from "@/lib/platform-axios";
import type { MonitoringData, MonitoringEvent, EventSeverity } from "@/types/monitoring.types";
import type { ApiUsageRow } from "@/types/platform/analytics-api.types";
import type { DashboardSummaryResponse } from "@/types/platform/dashboard-api.types";
import type {
  MonitoringRecentResponse,
  StreamEvent,
} from "@/types/platform/monitoring-api.types";

const EVENT_LABELS: Record<string, string> = {
  "finding.new": "New Finding",
  "risk.tier_changed": "Risk Tier Changed",
  "decision.status_changed": "Decision Status Changed",
  "decision.remediation_submitted": "Remediation Submitted",
  "decision.verified": "Decision Verified",
  "decision.reopened": "Decision Reopened",
  "situation.updated": "Situation Updated",
  "alert.new": "New Alert",
};

function humanizeType(type: string): string {
  return type
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getEventLabel(type: string): string {
  return EVENT_LABELS[type] ?? humanizeType(type);
}

function readString(payload: Record<string, unknown> | null, key: string): string | undefined {
  const value = payload?.[key];
  return typeof value === "string" ? value : undefined;
}

function getEventSeverity(event: StreamEvent): EventSeverity {
  const rawSeverity = readString(event.payload, "severity")?.toUpperCase();

  if (rawSeverity === "CRITICAL") return "critical";
  if (rawSeverity === "HIGH") return "warning";

  if (event.type === "decision.verified") return "success";
  if (event.type === "decision.reopened") return "critical";
  if (event.type === "finding.new" || event.type === "risk.tier_changed") return "warning";

  return "info";
}

function getEventMessage(event: StreamEvent, label: string): string {
  const payload = event.payload;
  const message = readString(payload, "message");
  if (message) return message;

  const title = readString(payload, "title");
  if (title) return title;

  const status = readString(payload, "status");
  if (status) return `${label}: ${status}`;

  return label;
}

function resolveEventDate(event: StreamEvent): string {
  return event.createdAt ?? event.timestamp ?? event.occurredAt ?? event.receivedAt ?? "";
}

function mapStreamEvent(event: StreamEvent): MonitoringEvent {
  const label = getEventLabel(event.type);

  return {
    id: event.id,
    type: label,
    message: getEventMessage(event, label),
    timestamp: resolveEventDate(event),
    severity: getEventSeverity(event),
    asset: readString(event.payload, "assetName") ?? readString(event.payload, "assetId"),
  };
}

export const getMonitoringData = async (): Promise<MonitoringData> => {
  const [recentRes, summaryRes, usageRes] = await Promise.all([
    platformApi.get<MonitoringRecentResponse>("/monitoring/recent"),
    platformApi.get<DashboardSummaryResponse>("/dashboard/summary"),
    platformApi.get<ApiUsageRow[]>("/analytics/api-usage", { params: { period: "day" } }),
  ]);

  const summary = summaryRes.data;
  const requestsToday =
    usageRes.data.length > 0 ? usageRes.data[usageRes.data.length - 1].count : 0;

  if (recentRes.data.events.length > 0) {
    console.info("[monitoring] raw recent event", recentRes.data.events[0]);
  }

  return {
    lastUpdated: recentRes.data.timestamp,
    stats: {
      apiRequests: requestsToday,
      assets: summary.counts.assets,
      decisions: summary.counts.decisions,
      risks: summary.counts.risks,
      events: summary.counts.events,
      findings: summary.counts.findings,
    },
    events: recentRes.data.events.map(mapStreamEvent),
  };
};
