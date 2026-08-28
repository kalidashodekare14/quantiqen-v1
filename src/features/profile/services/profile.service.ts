import { api } from "@/lib/axios";
import type { PortalProfile, UpdateProfileData } from "@/types/profile.types";

export const profileService = {
  get: async (): Promise<PortalProfile> => {
    const res = await api.get("/api/v1/portal/me");
    return res.data.user;
  },

  update: async (data: UpdateProfileData): Promise<PortalProfile> => {
    const res = await api.patch("/api/v1/portal/me", data);
    return res.data.user;
  },
};
