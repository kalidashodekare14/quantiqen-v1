"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/utils/date/date";
import type { CheckStatus, ScanJobDetail } from "@/types/platform/scan-api.types";
import { useScanJob } from "../hooks/useScans";

const checkStatusStyles: Record<CheckStatus, string> = {
  PASS: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  FAIL: "bg-destructive/10 text-destructive border-destructive/20",
  WARNING: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  ERROR: "bg-destructive/10 text-destructive border-destructive/20",
  TIMEOUT: "bg-muted text-muted-foreground border-border",
};

const ScanJobDetailDialog = ({
  jobId,
  onClose,
}: {
  jobId: string;
  onClose: () => void;
}) => {
  const { data: job, isLoading } = useScanJob(jobId);

  const renderJob = (detail: ScanJobDetail) => (
    <>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Asset</p>
          <p className="text-card-foreground font-medium">
            {detail.asset.name} ({detail.asset.identifier})
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Status</p>
          <Badge variant="outline">{detail.status}</Badge>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Created</p>
          <p className="text-card-foreground font-medium">
            {formatDateTime(detail.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Completed</p>
          <p className="text-card-foreground font-medium">
            {detail.completedAt ? formatDateTime(detail.completedAt) : "—"}
          </p>
        </div>
      </div>

      {detail.errorMessage && (
        <div className="border-destructive/30 bg-destructive/10 rounded-lg border p-3">
          <p className="text-card-foreground text-sm">{detail.errorMessage}</p>
        </div>
      )}

      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
          Results ({detail.results.length})
        </p>
        {detail.results.length === 0 ? (
          <p className="text-muted-foreground text-sm">No results recorded.</p>
        ) : (
          <div className="border-border flex flex-col gap-2 border-t pt-2">
            {detail.results.map((result) => (
              <div key={result.id} className="border-border border-b pb-2 last:border-b-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {result.scanType}
                  </Badge>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${checkStatusStyles[result.checkStatus]}`}
                  >
                    {result.checkStatus}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Risk: {result.riskLevel}
                  </span>
                </div>
                <p className="text-card-foreground mt-1 text-sm">{result.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Scan Job</DialogTitle>
          <DialogDescription>Job results and check output.</DialogDescription>
        </DialogHeader>

        {isLoading || !job ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          renderJob(job)
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScanJobDetailDialog;
