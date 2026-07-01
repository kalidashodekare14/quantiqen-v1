import { EventSeverity, RiskSeverity } from "@/types/severity.types";
import { Info, CheckCircle, AlertTriangle, AlertOctagon, type LucideIcon } from "lucide-react";

export const severityConfig: Record<
  EventSeverity,
  {
    icon: LucideIcon;
    color: string;
    className: string;
  }
> = {
  info: {
    icon: Info,
    color: "text-chart-5",
    className: "bg-chart-5/10 text-chart-5",
  },
  success: {
    icon: CheckCircle,
    color: "text-chart-2",
    className: "bg-chart-2/10 text-chart-2",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-chart-3",
    className: "bg-chart-3/10 text-chart-3",
  },
  critical: {
    icon: AlertOctagon,
    color: "text-destructive",
    className: "bg-destructive/10 text-destructive",
  },
};

export const severityStyles: Record<RiskSeverity, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-chart-3/10 text-chart-3",
  Medium: "bg-chart-5/10 text-chart-5",
  Low: "bg-muted text-muted-foreground",
};
