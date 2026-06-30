"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { useReports } from "./hooks/useReports"
import { ReportCard } from "./components/ReportCard"
import ReportsSkeleton from "./components/ReportsSkeleton"

export const ViewReports = () => {
  const { data, isLoading, isError } = useReports()

  if (isLoading) {
    return <ReportsSkeleton />
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Failed to load reports
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Reports"
        subtitle="Security reports and summaries"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.reports.map((report, index) => (
          <div
            key={report.id}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ReportCard report={report} />
          </div>
        ))}
      </div>
    </div>
  )
}
