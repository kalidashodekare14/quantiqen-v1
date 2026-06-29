import monitoringData from "@/mock-data/monitoring.json"
import { MonitoringData } from "@/types/monitoring.types"

export const monitoringService = async (): Promise<MonitoringData> => {
  return monitoringData as unknown as MonitoringData
}
