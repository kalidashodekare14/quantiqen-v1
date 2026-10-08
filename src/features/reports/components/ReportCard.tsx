"use client";

import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";

import AppButton from "@/components/shared/AppButton";
import { formatDateTime, formatRelativeTime } from "@/utils/date/date";
import { fadeInScale } from "@/lib/motion";
import type { Report, ReportStatus, ReportType } from "@/types/platform/report-api.types";

interface ReportCardProps {
  report: Report;
  onView: (report: Report) => void;
  onDownload: (report: Report) => void;
}

const typeBadgeStyles: Record<ReportType, string> = {
  SECURITY_POSTURE: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  RISK_ASSESSMENT: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  DECISION_SUMMARY: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  THREAT_INTELLIGENCE: "bg-destructive/10 text-destructive border-destructive/20",
  EXECUTIVE_SUMMARY: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  COMPLIANCE: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

const statusStyles: Record<ReportStatus, string> = {
  GENERATED: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  IN_REVIEW: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  APPROVED: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  LOCKED: "bg-muted text-muted-foreground border-border",
  PUBLISHED: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

export const ReportCard = ({ report, onView, onDownload }: ReportCardProps) => {
  return (
    <motion.div
      {...fadeInScale}
      className="bg-card/80 backdrop-blur-md border border-foreground/10 flex flex-col gap-4 rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium lg:text-sm ${typeBadgeStyles[report.reportType]}`}
        >
          {report.reportType.replaceAll("_", " ")}
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium lg:text-sm ${statusStyles[report.status]}`}
        >
          {report.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-card-foreground text-sm font-semibold lg:text-base">
          {report.title}
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed lg:text-base">
          {report.description ?? "No description provided."}
        </p>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs lg:text-sm">
        <span title={formatDateTime(report.createdAt)}>
          {formatRelativeTime(report.createdAt)}
        </span>
        <span>v{report.currentVersion}</span>
        {report.dateFrom && report.dateTo && (
          <span>
            {new Date(report.dateFrom).toLocaleDateString()} –{" "}
            {new Date(report.dateTo).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-3">
        <AppButton
          variant="outline"
          size="lg"
          icon={<FileText className="size-4" />}
          onClick={() => onView(report)}
        >
          View
        </AppButton>
        <AppButton
          variant="outline"
          size="lg"
          icon={<Download className="size-4" />}
          onClick={() => onDownload(report)}
        >
          Download
        </AppButton>
      </div>
    </motion.div>
  );
};
