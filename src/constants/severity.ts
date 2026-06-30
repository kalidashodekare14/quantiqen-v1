import { Info, CheckCircle, AlertTriangle, AlertOctagon, type LucideIcon } from "lucide-react";

import type { Severity } from "@/types/severity.types";

export const severityConfig: Record<
  Severity,
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
