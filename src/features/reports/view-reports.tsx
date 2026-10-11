"use client";

import { useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import AppButton from "@/components/shared/AppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/hooks/use-role";
import { getFriendlyError } from "@/utils/errorMessages";
import type {
  Report,
  ReportListParams,
  ReportStatus,
  ReportType,
} from "@/types/platform/report-api.types";
import { reportService } from "./services/reportService";
import { useReports } from "./hooks/useReports";
import { exportReport } from "./report-export";
import type { ReportExportFormat } from "./report-export";
import { ReportCard } from "./components/ReportCard";
import ReportsSkeleton from "./components/ReportsSkeleton";
import ReportViewerDialog from "./components/ReportViewerDialog";
import GenerateReportDialog from "./components/GenerateReportDialog";

const REPORT_STATUSES: ReportStatus[] = [
  "GENERATED",
  "IN_REVIEW",
  "APPROVED",
  "LOCKED",
  "PUBLISHED",
];

const REPORT_TYPES: ReportType[] = [
  "SECURITY_POSTURE",
  "RISK_ASSESSMENT",
  "DECISION_SUMMARY",
  "THREAT_INTELLIGENCE",
  "EXECUTIVE_SUMMARY",
  "COMPLIANCE",
];

const PAGE_SIZE = 12;

export const ViewReports = () => {
  const [status, setStatus] = useState("ALL");
  const [reportType, setReportType] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const params: ReportListParams = {
    page,
    limit: PAGE_SIZE,
    ...(status !== "ALL" ? { status: status as ReportStatus } : {}),
    ...(reportType !== "ALL" ? { reportType: reportType as ReportType } : {}),
    ...(dateFrom ? { dateFrom: new Date(dateFrom).toISOString() } : {}),
    ...(dateTo ? { dateTo: new Date(dateTo).toISOString() } : {}),
  };

  const { data, isLoading, isError, refetch } = useReports(params);

  const handleDownload = async (report: Report, format: ReportExportFormat) => {
    if (exportingId) return;
    setExportingId(report.id);
    try {
      const detail = await reportService.getById(report.id);
      const latestVersion = detail.versions[0];
      if (!latestVersion) {
        toast.error("This report has no versions to download.");
        return;
      }
      await exportReport(detail, latestVersion, format);
      toast.success("Report downloaded.");
    } catch (error) {
      toast.error(getFriendlyError(error).message);
    } finally {
      setExportingId(null);
    }
  };

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Reports"
        subtitle="Security reports and summaries"
        action={
          isAdmin && (
            <AppButton variant="primary" size="md" onClick={() => setGenerateOpen(true)}>
              <FilePlus2 className="mr-1.5 size-4" />
              Generate Report
            </AppButton>
          )
        }
      />

      <div className="bg-card flex flex-wrap items-end gap-3 rounded-xl p-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Status</span>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
            <SelectTrigger className="h-9 w-40" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {REPORT_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Type</span>
          <Select value={reportType} onValueChange={(value) => { setReportType(value); setPage(1); }}>
            <SelectTrigger className="h-9 w-52" aria-label="Filter by report type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {REPORT_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">From</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="h-9 w-38"
            aria-label="Filter from date"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">To</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="h-9 w-38"
            aria-label="Filter to date"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{data?.total ?? 0} reports</span>
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

      {isError ? (
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="text-destructive text-sm">Failed to load reports</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !data || data.reports.length === 0 ? (
        <div className="bg-card flex items-center justify-center rounded-xl p-10">
          <p className="text-muted-foreground text-sm">No reports found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              exporting={exportingId === report.id}
              onView={setViewingReport}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {generateOpen && <GenerateReportDialog open={generateOpen} onClose={() => setGenerateOpen(false)} />}

      {viewingReport && (
        <ReportViewerDialog report={viewingReport} open onClose={() => setViewingReport(null)} />
      )}
    </div>
  );
};
