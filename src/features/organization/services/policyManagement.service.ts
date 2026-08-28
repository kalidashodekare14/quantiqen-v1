import { api } from "@/lib/axios";
import type { PortalPolicy, UpdatePolicyData } from "../types/policy-management.types";

export const policyManagementService = {
  get: async (): Promise<PortalPolicy> => {
    const res = await api.get("/api/v1/portal/policy");
    return res.data;
  },

  update: async (data: UpdatePolicyData): Promise<PortalPolicy> => {
    const res = await api.patch("/api/v1/portal/policy", data);
    return res.data;
  },
};
