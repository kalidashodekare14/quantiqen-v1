"use client"

import { motion } from "framer-motion"
import { FileText, Download } from "lucide-react"
import { Report } from "@/types/report.types"

interface ReportCardProps {
  report: Report
}

function getRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

const typeBadgeStyles: Record<string, string> = {
  Executive: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  Technical: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Compliance: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Weekly: "bg-destructive/10 text-destructive border-destructive/20",
}

export const ReportCard = ({ report }: ReportCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-card border rounded-xl p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${typeBadgeStyles[report.type] ?? ""}`}
        >
          {report.type}
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-500 border-blue-500/20">
          {report.format}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-card-foreground">{report.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {report.description}
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{getRelativeTime(report.generatedAt)}</span>
        <span>{report.size}</span>
      </div>

      <div className="flex items-center gap-3 mt-auto">
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-border text-card-foreground hover:bg-accent transition-colors">
          <FileText className="size-4" />
          View
        </button>
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-chart-5 text-white hover:opacity-90 transition-opacity">
          <Download className="size-4" />
          Download
        </button>
      </div>
    </motion.div>
  )
}
