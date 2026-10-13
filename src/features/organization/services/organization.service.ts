import { getPlatformOrganization } from "@/services/organization.service";
import type { PlatformOrganization } from "@/types/platform/organization.types";

export const organizationService = async (): Promise<PlatformOrganization> => {
  return getPlatformOrganization();
};
