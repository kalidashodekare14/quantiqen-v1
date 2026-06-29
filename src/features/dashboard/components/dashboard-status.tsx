import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/common/section-card";

interface SystemService {
  name: string;
  status: "operational" | "degraded" | "down";
  description: string;
  progress: number;
}

const SERVICES: SystemService[] = [
  { name: "API Gateway", status: "operational", description: "98.2% uptime", progress: 98 },
  { name: "AI Engine", status: "operational", description: "99.7% uptime", progress: 99 },
  { name: "Database", status: "operational", description: "100% uptime", progress: 100 },
  { name: "Authentication", status: "degraded", description: "89.5% uptime", progress: 89 },
  { name: "Monitoring", status: "operational", description: "99.9% uptime", progress: 99 },
];

const STATUS_VARIANT = {
  operational: "default" as const,
  degraded: "outline" as const,
  down: "destructive" as const,
};

const STATUS_LABEL = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

const STATUS_DOT = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
};

const PROGRESS_COLOR = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
};

export function DashboardStatus() {
  return (
    <SectionCard title="System Status">
      <div className="flex flex-col gap-4">
        {SERVICES.map((service) => (
          <div key={service.name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", STATUS_DOT[service.status])} />
                <span className="text-sm font-medium">{service.name}</span>
              </div>

              <Badge variant={STATUS_VARIANT[service.status]}>{STATUS_LABEL[service.status]}</Badge>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", PROGRESS_COLOR[service.status])}
                style={{ width: `${service.progress}%` }}
              />
            </div>

            <span className="text-xs text-muted-foreground">{service.description}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
