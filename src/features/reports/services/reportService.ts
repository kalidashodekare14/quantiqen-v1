import reportsData from "@/mock-data/reports.json"
import { ReportsData } from "@/types/report.types"

export const reportService = async (): Promise<ReportsData> => {
  return reportsData as unknown as ReportsData
}
