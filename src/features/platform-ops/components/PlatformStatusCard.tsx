"use client";

import { motion } from "framer-motion";
import { Server, Database, Radio } from "lucide-react";

import { fadeInUp } from "@/lib/motion";
import { formatDateTime } from "@/utils/date/date";
import { usePlatformStatus, useSuspensionMetrics } from "@/hooks/use-platform-ops";
import type { StatusQueueDetail } from "@/types/platform/platform-ops.types";

export const healthBadgeClass = (value: string): string => {
  const normalized = value.toLowerCase();
  if (normalized.includes("healthy") || normalized.includes("operational") || normalized === "ok") {
    return "bg-chart-2/10 text-chart-2 border-chart-2/20";
  }
  if (normalized.includes("degraded") || normalized.includes("recovering") || normalized.includes("pending")) {
    return "bg-chart-3/10 text-chart-3 border-chart-3/20";
  }
  if (normalized.includes("unavailable") || normalized.includes("down") || normalized.includes("fail")) {
    return "bg-destructive/10 text-destructive border-destructive/20";
  }
  return "bg-muted text-muted-foreground border-border";
};

const Chip = ({ label, value }: { label: string; value: string }) => (
  <span className="flex items-center gap-1.5">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${healthBadgeClass(value)}`}
    >
      {value}
    </span>
  </span>
);

const QueueTable = ({ queueDetails }: { queueDetails: Record<string, StatusQueueDetail> }) => {
  const entries = Object.entries(queueDetails);
  if (entries.length === 0) return null;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-border border-b">
          <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
            Queue
          </th>
          <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
            Waiting
          </th>
          <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
            Failed
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([name, detail]) => (
          <tr key={name} className="border-border border-b last:border-b-0">
            <td className="text-card-foreground px-2 py-2 text-xs">{name}</td>
            <td className="text-card-foreground px-2 py-2 text-xs">{detail.waiting}</td>
            <td
              className={`px-2 py-2 text-xs ${detail.failed > 0 ? "text-destructive font-medium" : "text-card-foreground"}`}
            >
              {detail.failed}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PlatformStatusCard = () => {
  const { data: status, isLoading: statusLoading } = usePlatformStatus();
  const { data: suspension, isLoading: suspensionLoading } = useSuspensionMetrics();

  return (
    <motion.div {...fadeInUp()} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-card-foreground flex items-center gap-2 text-sm font-semibold lg:text-base">
          <Server className="size-4" />
          Status Rollup
        </h3>
        {status && (
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${healthBadgeClass(status.overall)}`}
          >
            {status.overall}
          </span>
        )}
      </div>

      {statusLoading || !status ? (
        <p className="text-muted-foreground text-sm">Loading status…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Chip label="DB" value={status.components.database} />
            <Chip label="Redis" value={status.components.redis} />
            <Chip label="Pub/Sub" value={status.components.redisPubSub} />
            <Chip label="BullMQ" value={status.components.redisBullmq} />
            <Chip label="Workers" value={status.components.workers} />
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Radio className="size-3.5" />
              {status.components.realtime}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {Object.entries(status.components.queues).map(([name, value]) => (
              <Chip key={name} label={name} value={value} />
            ))}
          </div>

          <div className="border-border border-t pt-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              Queue Depth
            </p>
            <QueueTable queueDetails={status.components.queueDetails} />
            <p className="text-muted-foreground mt-2 text-xs">
              Failed jobs: {status.components.failedJobCount} · checked{" "}
              {formatDateTime(status.timestamp)}
            </p>
          </div>
        </div>
      )}

      <div className="border-border mt-4 border-t pt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-card-foreground flex items-center gap-2 text-sm font-semibold">
            <Database className="size-4" />
            Suspension
          </h4>
          {suspension && (
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${healthBadgeClass(suspension.isActive ? "unavailable" : "healthy")}`}
            >
              {suspension.isActive ? "ACTIVE" : "INACTIVE"}
            </span>
          )}
        </div>

        {suspensionLoading || !suspension ? (
          <p className="text-muted-foreground text-sm">Loading suspension metrics…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-xs">Triggered By</p>
              <p className="text-card-foreground text-sm font-medium">
                {suspension.triggeredBy ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Activated</p>
              <p className="text-card-foreground text-sm font-medium">
                {suspension.activatedAt ? formatDateTime(suspension.activatedAt) : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Findings Queued</p>
              <p className="text-card-foreground text-sm font-medium">
                {suspension.findingsQueued}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Findings Processed</p>
              <p className="text-card-foreground text-sm font-medium">
                {suspension.findingsProcessed}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlatformStatusCard;
