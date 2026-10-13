import { platformApi } from "@/lib/platform-axios";
import type { PlatformOrganization } from "@/types/platform/organization.types";

export const getPlatformOrganization = async (): Promise<PlatformOrganization> => {
  const res = await platformApi.get<PlatformOrganization>("/organizations/me");
  return res.data;
};
