import { severityStyles } from "@/constants/severity";
import type { DecisionStatus } from "@/types/platform/decision-api.types";

export const decisionStatusStyles: Record<string, string> = {
  PENDING: "bg-chart-3/10 text-chart-3",
  UNDER_REVIEW: "bg-chart-5/10 text-chart-5",
  APPROVED: "bg-chart-2/10 text-chart-2",
  IN_PROGRESS: "bg-chart-5/10 text-chart-5",
  REMEDIATION_SUBMITTED: "bg-chart-5/10 text-chart-5",
  RESOLVED: "bg-chart-2/10 text-chart-2",
  VERIFIED: "bg-chart-2/10 text-chart-2",
  REOPENED: "bg-destructive/10 text-destructive",
  REJECTED: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-muted text-muted-foreground",
};

export function statusBadgeClass(status: DecisionStatus | string): string {
  return (
    decisionStatusStyles[status] ?? "bg-muted text-muted-foreground"
  );
}

export function tierBadgeClass(tier: string): string {
  const key = tier.charAt(0) + tier.slice(1).toLowerCase();
  return (
    severityStyles[key as keyof typeof severityStyles] ?? "bg-muted text-muted-foreground"
  );
}
