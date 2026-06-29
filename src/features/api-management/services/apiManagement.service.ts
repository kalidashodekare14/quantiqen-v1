import apiManagementData from "@/mock-data/api-management.json"
import { ApiManagementData } from "@/types/api-management.types"

export const apiManagementService = async (): Promise<ApiManagementData> => {
  return apiManagementData as unknown as ApiManagementData
}
