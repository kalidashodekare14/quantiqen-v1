"use client";

import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";
import AppButton from "@/components/shared/AppButton";
import { Report } from "@/types/report.types";
import { formatRelativeTime } from "@/utils/date/date";

interface ReportCardProps {
  report: Report;
}

const typeBadgeStyles: Record<string, string> = {
  Executive: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  Technical: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Compliance: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Weekly: "bg-destructive/10 text-destructive border-destructive/20",
};

export const ReportCard = ({ report }: ReportCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-card flex flex-col gap-4 rounded-xl border p-5"
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium lg:text-sm ${typeBadgeStyles[report.type] ?? ""}`}
        >
          {report.type}
        </span>
        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-500 lg:text-sm">
          {report.format}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-card-foreground text-sm font-semibold lg:text-base">{report.title}</h3>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed lg:text-base">
          {report.description}
        </p>
      </div>

      <div className="text-muted-foreground flex items-center gap-3 text-xs lg:text-sm">
        <span>{formatRelativeTime(report.generatedAt)}</span>
        <span>{report.size}</span>
      </div>

      <div className="mt-auto flex items-center gap-3">
        <AppButton variant="outline" size="lg" icon={<FileText className="size-4" />}>
          View
        </AppButton>
        <AppButton variant="outline" size="lg" icon={<Download className="size-4" />}>
          Download
        </AppButton>
      </div>
    </motion.div>
  );
};
