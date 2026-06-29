"use client"

import { useReports } from "./hooks/useReports"
import { ReportCard } from "./components/ReportCard"

export const ViewReports = () => {
  const { data, isLoading, isError } = useReports()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-card-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Security reports and summaries
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border rounded-xl p-5 h-48 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
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
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-card-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Security reports and summaries
        </p>
      </div>
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
