"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { severityStyles } from "@/constants/severity";
import { useRole } from "@/hooks/use-role";
import { formatDateTime, formatRelativeTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import type {
  PlatformSeverity,
  Situation,
  SituationStatus,
} from "@/types/platform/situation.types";
import { SITUATION_TRANSITIONS } from "@/types/platform/situation.types";
import {
  useSituationDetail,
  useSituations,
  useUpdateSituationStatus,
} from "../hooks/useSituations";

const STATUS_OPTIONS: SituationStatus[] = ["ACTIVE", "INVESTIGATING", "RESOLVED", "CLOSED"];
const SEVERITY_OPTIONS: PlatformSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
const PAGE_SIZE = 10;

function severityClass(severity: PlatformSeverity): string {
  if (severity === "INFO") return "bg-muted text-muted-foreground";
  const key = severity.charAt(0) + severity.slice(1).toLowerCase();
  return severityStyles[key as keyof typeof severityStyles] ?? "bg-muted text-muted-foreground";
}

const SituationsPanel = () => {
  const [status, setStatus] = useState<string>("ALL");
  const [severity, setSeverity] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { hasAnyRole } = useRole();
  const canUpdateStatus = hasAnyRole(["CUSTOMER_ADMIN", "ANALYST"]);

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(status !== "ALL" ? { status: status as SituationStatus } : {}),
    ...(severity !== "ALL" ? { severity: severity as PlatformSeverity } : {}),
  };

  const { data, isLoading, isError, refetch } = useSituations(params);
  const { data: detail, isLoading: detailLoading } = useSituationDetail(selectedId ?? undefined);
  const updateStatus = useUpdateSituationStatus();

  const totalPages = data?.totalPages ?? 1;

  const handleStatusChange = (statusValue: SituationStatus) => {
    if (!selectedId) return;
    updateStatus.mutate(
      { id: selectedId, body: { status: statusValue } },
      {
        onSuccess: () => {
          toast.success(`Situation moved to ${statusValue}`);
        },
        onError: (error) => {
          toast.error(getFriendlyError(error).message);
        },
      },
    );
  };

  const resetPageAndSet = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card flex flex-wrap items-center gap-3 rounded-xl p-3">
        <Select value={status} onValueChange={resetPageAndSet(setStatus)}>
          <SelectTrigger className="h-9 w-48" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={severity} onValueChange={resetPageAndSet(setSeverity)}>
          <SelectTrigger className="h-9 w-48" aria-label="Filter by severity">
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All severities</SelectItem>
            {SEVERITY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="bg-card/80 border-foreground/10 hover:border-primary/40 hover:shadow-primary/5 overflow-x-auto rounded-xl border backdrop-blur-md transition-all duration-200 hover:shadow-lg">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-muted-foreground text-sm">Unable to load situations.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : !data || data.situations.length === 0 ? (
          <div className="flex items-center justify-center p-10">
            <p className="text-muted-foreground text-sm">No situations found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.situations.map((situation: Situation) => (
                <TableRow
                  key={situation.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedId(situation.id)}
                >
                  <TableCell className="max-w-72 truncate font-medium">
                    {situation.title}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityClass(situation.severity)}`}
                    >
                      {situation.severity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{situation.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatRelativeTime(situation.lastSeenAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(situation.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-xl">
          {detailLoading || !detail ? (
            <div className="flex flex-col gap-3 py-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detail.title}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityClass(detail.severity)}`}
                  >
                    {detail.severity}
                  </span>
                  <Badge variant="secondary">{detail.status}</Badge>
                </DialogTitle>
                <DialogDescription>
                  {detail.description ?? "No description provided."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">First seen</p>
                  <p className="text-card-foreground">{formatDateTime(detail.firstSeenAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last seen</p>
                  <p className="text-card-foreground">{formatDateTime(detail.lastSeenAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Related situations</p>
                  <p className="text-card-foreground">{detail.relations.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Linked decisions</p>
                  <p className="text-card-foreground">{detail.decisions.length}</p>
                </div>
              </div>

              {detail.decisions.length > 0 && (
                <div className="border-border border-t pt-3">
                  <p className="text-card-foreground mb-2 text-sm font-semibold">
                    Linked decisions
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {detail.decisions.map((decision) => (
                      <div
                        key={decision.id}
                        className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                      >
                        <span className="text-muted-foreground font-mono text-xs">
                          {decision.id.slice(0, 8)}…
                        </span>
                        <span className="flex items-center gap-2">
                          {decision.risk && (
                            <Badge variant="outline">{decision.risk.tier}</Badge>
                          )}
                          <Badge variant="secondary">{decision.status}</Badge>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canUpdateStatus && SITUATION_TRANSITIONS[detail.status].length > 0 && (
                <div className="border-border border-t pt-3">
                  <p className="text-card-foreground mb-2 text-sm font-semibold">
                    Update status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SITUATION_TRANSITIONS[detail.status].map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        size="sm"
                        variant="outline"
                        disabled={updateStatus.isPending}
                        onClick={() => handleStatusChange(nextStatus)}
                      >
                        {nextStatus}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SituationsPanel;
