"use client";

import { useState } from "react";

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
import { formatDateTime, formatRelativeTime } from "@/utils/date/date";
import type {
  NetworkObservation,
  ObservationStatus,
  ObservationType,
  PlatformSeverity,
} from "@/types/platform/network-observation.types";
import {
  useNetworkObservationDetail,
  useNetworkObservations,
} from "../hooks/useNetworkObservations";

const TYPE_OPTIONS: ObservationType[] = [
  "PORT_SCAN_DETECTED",
  "SYN_FLOOD",
  "ICMP_ANOMALY",
  "SUSPICIOUS_SOURCE",
  "SUSPICIOUS_DESTINATION",
  "TRAFFIC_SPIKE",
  "REPEATED_CONNECTION_FAILURE",
  "MALICIOUS_IP_COMMUNICATION",
  "SENSITIVE_PORT_ACTIVITY",
  "DATA_EXFILTRATION_INDICATOR",
];

const STATUS_OPTIONS: ObservationStatus[] = ["NEW", "PROMOTED_TO_ALERT", "CLOSED"];
const SEVERITY_OPTIONS: PlatformSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
const PAGE_SIZE = 10;

function severityClass(severity: PlatformSeverity): string {
  if (severity === "INFO") return "bg-muted text-muted-foreground";
  const key = severity.charAt(0) + severity.slice(1).toLowerCase();
  return severityStyles[key as keyof typeof severityStyles] ?? "bg-muted text-muted-foreground";
}

const NetworkObservationsPanel = () => {
  const [type, setType] = useState<string>("ALL");
  const [severity, setSeverity] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(type !== "ALL" ? { observationType: type as ObservationType } : {}),
    ...(severity !== "ALL" ? { severity: severity as PlatformSeverity } : {}),
    ...(status !== "ALL" ? { status: status as ObservationStatus } : {}),
  };

  const { data, isLoading, isError, refetch } = useNetworkObservations(params);
  const { data: detail, isLoading: detailLoading } = useNetworkObservationDetail(
    selectedId ?? undefined,
  );

  const totalPages = data?.pagination.totalPages ?? 1;

  const resetPageAndSet = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card flex flex-wrap items-center gap-3 rounded-xl p-3">
        <Select value={type} onValueChange={resetPageAndSet(setType)}>
          <SelectTrigger className="h-9 w-56" aria-label="Filter by observation type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={severity} onValueChange={resetPageAndSet(setSeverity)}>
          <SelectTrigger className="h-9 w-44" aria-label="Filter by severity">
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

        <Select value={status} onValueChange={resetPageAndSet(setStatus)}>
          <SelectTrigger className="h-9 w-44" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option.replaceAll("_", " ")}
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
            <p className="text-muted-foreground text-sm">Unable to load network observations.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex items-center justify-center p-10">
            <p className="text-muted-foreground text-sm">No network observations found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Observation</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source IP</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((observation: NetworkObservation) => (
                <TableRow
                  key={observation.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedId(observation.id)}
                >
                  <TableCell className="font-medium">
                    {observation.observationType.replaceAll("_", " ")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityClass(observation.severity)}`}
                    >
                      {observation.severity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{observation.status.replaceAll("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{observation.sourceIp ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {observation.asset?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatRelativeTime(observation.lastSeenAt)}
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
                  {detail.observationType.replaceAll("_", " ")}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityClass(detail.severity)}`}
                  >
                    {detail.severity}
                  </span>
                  <Badge variant="secondary">{detail.status.replaceAll("_", " ")}</Badge>
                </DialogTitle>
                <DialogDescription>
                  Observed {formatDateTime(detail.firstSeenAt)} — last seen{" "}
                  {formatDateTime(detail.lastSeenAt)}.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Source IP</p>
                  <p className="text-card-foreground font-mono">{detail.sourceIp ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Asset</p>
                  <p className="text-card-foreground">
                    {detail.asset ? `${detail.asset.name} (${detail.asset.identifier})` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">First seen</p>
                  <p className="text-card-foreground">{formatDateTime(detail.firstSeenAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last seen</p>
                  <p className="text-card-foreground">{formatDateTime(detail.lastSeenAt)}</p>
                </div>
              </div>

              {detail.details && Object.keys(detail.details).length > 0 && (
                <div className="border-border border-t pt-3">
                  <p className="text-card-foreground mb-2 text-sm font-semibold">Details</p>
                  <pre className="bg-muted/50 text-card-foreground max-h-48 overflow-auto rounded-lg p-3 text-xs">
                    {JSON.stringify(detail.details, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetworkObservationsPanel;
