"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Inbox, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fadeInUp } from "@/lib/motion";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import {
  DLQ_REASONS,
  RECOVERY_PRIORITIES,
  type DlqFailuresParams,
  type DlqReason,
  type RecoveryPriority,
} from "@/types/platform/platform-ops.types";
import { useDlqFailures, useDlqOverview, useReplayFailure } from "@/hooks/use-platform-ops";
import { healthBadgeClass } from "./PlatformStatusCard";

const PAGE_SIZE = 20;

const recoveredValue = (value: string): boolean | undefined => {
  if (value === "ALL") return undefined;
  return value === "RECOVERED";
};

const DlqSection = () => {
  const [queueName, setQueueName] = useState("");
  const [reasonCode, setReasonCode] = useState<"ALL" | DlqReason>("ALL");
  const [priority, setPriority] = useState<"ALL" | RecoveryPriority>("ALL");
  const [recovered, setRecovered] = useState<"ALL" | "RECOVERED" | "UNRECOVERED">("ALL");
  const [page, setPage] = useState(1);

  const { data: overview, isLoading: overviewLoading } = useDlqOverview(true);

  const params: DlqFailuresParams = {
    page,
    limit: PAGE_SIZE,
    ...(queueName.trim() ? { queueName: queueName.trim() } : {}),
    ...(reasonCode !== "ALL" ? { reasonCode } : {}),
    ...(priority !== "ALL" ? { recoveryPriority: priority } : {}),
    ...(recovered !== "ALL" ? { recovered: recoveredValue(recovered) as boolean } : {}),
  };

  const { data, isLoading, isError, refetch } = useDlqFailures(params, true);
  const replay = useReplayFailure();

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const handleReplay = (id: string, dryRun: boolean) => {
    replay.mutate(
      { id, dryRun },
      {
        onSuccess: (response) => {
          if (response.queued) {
            toast.success(`Re-enqueued as ${response.newJobId}`);
          } else if (dryRun && response.skipped) {
            toast.info(response.skipped);
          } else if (response.skipped) {
            toast.info(response.skipped);
          } else {
            toast.success("Replay requested.");
          }
        },
        onError: handleError,
      },
    );
  };

  return (
    <motion.div {...fadeInUp(0.1)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-card-foreground flex items-center gap-2 text-sm font-semibold lg:text-base">
          <Inbox className="size-4" />
          Dead Letter Queue
        </h3>
        {overview && (
          <span className="text-muted-foreground text-sm">
            {overview.total} unrecovered · {overview.recoveredCount}/{overview.totalCount}{" "}
            recovered (all-time)
          </span>
        )}
      </div>

      {overviewLoading || !overview ? (
        <p className="text-muted-foreground text-sm">Loading DLQ overview…</p>
      ) : (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(overview.byQueue).map(([name, count]) => (
            <span key={name} className="border-border text-muted-foreground rounded-full border px-2.5 py-1 text-xs">
              {name}: {count}
            </span>
          ))}
          {Object.entries(overview.byPriority).map(([level, count]) =>
            count > 0 ? (
              <span
                key={level}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${healthBadgeClass(level === "CRITICAL" || level === "HIGH" ? "failed" : "degraded")}`}
              >
                {level}: {count}
              </span>
            ) : null,
          )}
          <span className="text-muted-foreground rounded-full border border-border px-2.5 py-1 text-xs">
            avg age: {Math.round(overview.avgAgeMs / 1000)}s
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Queue</span>
          <Input
            value={queueName}
            onChange={(e) => {
              setQueueName(e.target.value);
              setPage(1);
            }}
            placeholder="notifications"
            className="h-9 w-40"
            aria-label="Filter by queue name"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Reason</span>
          <Select
            value={reasonCode}
            onValueChange={(value) => {
              setReasonCode(value as "ALL" | DlqReason);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-48" aria-label="Filter by reason">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All reasons</SelectItem>
              {DLQ_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Priority</span>
          <Select
            value={priority}
            onValueChange={(value) => {
              setPriority(value as "ALL" | RecoveryPriority);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-36" aria-label="Filter by priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              {RECOVERY_PRIORITIES.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Recovered</span>
          <Select
            value={recovered}
            onValueChange={(value) => {
              setRecovered(value as "ALL" | "RECOVERED" | "UNRECOVERED");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-40" aria-label="Filter by recovered state">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="UNRECOVERED">Unrecovered</SelectItem>
              <SelectItem value="RECOVERED">Recovered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-1.5 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading failures…</p>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-destructive text-sm">Failed to load DLQ failures.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !data || data.items.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">No failures found.</p>
      ) : (
        <>
          <div className="border-border overflow-x-auto border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                    Priority
                  </th>
                  <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                    Queue
                  </th>
                  <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                    Reason
                  </th>
                  <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                    Error
                  </th>
                  <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                    Failed At
                  </th>
                  <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                    State
                  </th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((failure) => (
                  <tr key={failure.id} className="border-border border-b last:border-b-0">
                    <td className="px-2 py-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${healthBadgeClass(failure.recoveryPriority === "CRITICAL" || failure.recoveryPriority === "HIGH" ? "failed" : "degraded")}`}
                      >
                        {failure.recoveryPriority}
                      </span>
                    </td>
                    <td className="text-card-foreground px-2 py-2 text-xs">
                      {failure.queueName}
                    </td>
                    <td className="text-muted-foreground px-2 py-2 text-xs">
                      {failure.reasonCode.replaceAll("_", " ")}
                    </td>
                    <td className="text-muted-foreground max-w-56 truncate px-2 py-2 text-xs">
                      {failure.errorMessage}
                    </td>
                    <td className="text-muted-foreground px-2 py-2 text-xs">
                      {formatDateTime(failure.failedAt)}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${healthBadgeClass(failure.recovered ? "healthy" : "unavailable")}`}
                      >
                        {failure.recovered ? "Recovered" : "Unrecovered"}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled={replay.isPending}
                          onClick={() => handleReplay(failure.id, true)}
                        >
                          Dry Run
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={replay.isPending}
                          onClick={() => handleReplay(failure.id, false)}
                        >
                          Replay
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Page {data.page} of {data.totalPages} · {data.total} total
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= data.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DlqSection;
