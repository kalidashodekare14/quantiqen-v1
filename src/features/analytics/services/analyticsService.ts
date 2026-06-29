import analyticsData from "@/mock-data/analytics.json"
import { AnalyticsData } from "@/types/analytics.types"

export const analyticsService = async (): Promise<AnalyticsData> => {
  return analyticsData as unknown as AnalyticsData
}
