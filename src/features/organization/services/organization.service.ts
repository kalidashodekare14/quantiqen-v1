import organizationData from "@/mock-data/organization.json"
import { OrganizationData } from "@/types/organization.types"

export const organizationService = async (): Promise<OrganizationData> => {
  return organizationData as unknown as OrganizationData
}
