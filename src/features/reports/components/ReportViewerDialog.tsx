"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import type { Report, ReportStatus } from "@/types/platform/report-api.types";
import { REPORT_TRANSITIONS } from "@/types/platform/report-api.types";
import {
  useReportDetail,
  useReportVersion,
  useReportVersions,
  useUpdateReportStatus,
} from "../hooks/useReports";
import { exportReport } from "../report-export";
import type { ReportExportFormat } from "../report-export";
import { normalizeReportContent } from "../report-content";
import ReportDownloadMenu from "./ReportDownloadMenu";

interface ReportViewerDialogProps {
  report: Report;
  open: boolean;
  onClose: () => void;
}

const statusStyles: Record<ReportStatus, string> = {
  GENERATED: "bg-chart-5/10 text-chart-5",
  IN_REVIEW: "bg-chart-3/10 text-chart-3",
  APPROVED: "bg-chart-2/10 text-chart-2",
  LOCKED: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-chart-2/10 text-chart-2",
};

const ReportViewerDialog = ({ report, open, onClose }: ReportViewerDialogProps) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>("latest");
  const [correctionTarget, setCorrectionTarget] = useState<ReportStatus | null>(null);
  const [correctionNote, setCorrectionNote] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const { data: detail, isLoading } = useReportDetail(open ? report.id : undefined);
  const { data: versions } = useReportVersions(open ? report.id : undefined);
  const { data: selectedVersion } = useReportVersion(
    report.id,
    selectedVersionId !== "latest" ? selectedVersionId : undefined,
  );
  const updateStatus = useUpdateReportStatus();

  const activeVersion =
    selectedVersionId === "latest" ? detail?.versions[0] : selectedVersion;
  const content = normalizeReportContent(activeVersion?.content);
  const transitions = REPORT_TRANSITIONS[detail?.status ?? report.status];

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const handleExport = async (format: ReportExportFormat) => {
    if (!detail || !activeVersion || isExporting) return;
    setIsExporting(true);
    try {
      await exportReport(detail, activeVersion, format);
      toast.success("Report downloaded.");
    } catch (error) {
      handleError(error);
    } finally {
      setIsExporting(false);
    }
  };

  const applyTransition = (target: ReportStatus, note?: string) => {
    updateStatus.mutate(
      {
        id: report.id,
        body: {
          status: target,
          ...(target === "GENERATED" && note ? { correctionNote: note } : {}),
        },
      },
      {
        onSuccess: (response) => {
          if ("reportId" in response) {
            toast.success(`Correction recorded — new version ${response.version} created.`);
          } else {
            toast.success(`Status changed to ${target.replaceAll("_", " ")}.`);
          }
          setCorrectionTarget(null);
          setCorrectionNote("");
        },
        onError: handleError,
      },
    );
  };

  const handleTransitionClick = (target: ReportStatus) => {
    if (target === "GENERATED") {
      setCorrectionTarget(target);
      return;
    }
    applyTransition(target);
  };

  const handleConfirmCorrection = () => {
    if (!correctionNote.trim()) {
      toast.error("A correction note is required.");
      return;
    }
    applyTransition("GENERATED", correctionNote.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {detail?.title ?? report.title}
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[detail?.status ?? report.status]}`}
            >
              {(detail?.status ?? report.status).replaceAll("_", " ")}
            </span>
            <Badge variant="outline">
              {(detail?.reportType ?? report.reportType).replaceAll("_", " ")}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {detail?.description ?? report.description ?? "No description provided."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
            <SelectTrigger className="h-9 w-56" aria-label="Select version">
              <SelectValue placeholder="Latest version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">
                Latest (v{detail?.currentVersion ?? report.currentVersion})
              </SelectItem>
              {versions?.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  v{version.versionNumber} — {formatDateTime(version.createdAt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto">
            <ReportDownloadMenu
              size="sm"
              disabled={!activeVersion || isExporting}
              onSelect={handleExport}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !activeVersion ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No version content available.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {activeVersion.correctionNote && (
              <div className="border-chart-3/30 bg-chart-3/10 rounded-lg border p-3">
                <p className="text-card-foreground text-sm">
                  <span className="font-medium">Correction note:</span>{" "}
                  {activeVersion.correctionNote}
                </p>
              </div>
            )}

            <p className="text-muted-foreground text-xs">
              Version {activeVersion.versionNumber} · generated{" "}
              {formatDateTime(content.generatedAt)}
              {activeVersion.contentHash ? (
                <>
                  {" · hash "}
                  <span className="font-mono">
                    {activeVersion.contentHash.slice(0, 12)}…
                  </span>
                </>
              ) : null}
            </p>

            {content.sections.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No content available for this version.
              </p>
            ) : (
              content.sections.map((section, index) => (
                <div key={`${section.heading}-${index}`} className="border-border border-t pt-3">
                  <p className="text-card-foreground text-sm font-semibold">{section.heading}</p>
                  <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                    {section.body}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {isAdmin && transitions.length > 0 && (
          <div className="border-border border-t pt-4">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              Transition
            </p>
            <div className="flex flex-wrap gap-2">
              {transitions.map((target) => (
                <Button
                  key={target}
                  size="sm"
                  variant={target === "GENERATED" ? "outline" : "default"}
                  disabled={updateStatus.isPending}
                  onClick={() => handleTransitionClick(target)}
                >
                  {target === "GENERATED"
                    ? "Correct (back to Generated)"
                    : `Move to ${target.replaceAll("_", " ")}`}
                </Button>
              ))}
            </div>
          </div>
        )}

        {correctionTarget && (
          <div className="border-chart-3/30 bg-chart-3/10 flex flex-col gap-2 rounded-lg border p-3">
            <p className="text-card-foreground text-sm font-medium">
              Correction note (required)
            </p>
            <Input
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              placeholder="Why is this report being corrected?"
              maxLength={2000}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setCorrectionTarget(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmCorrection}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? "Applying…" : "Apply correction"}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportViewerDialog;
