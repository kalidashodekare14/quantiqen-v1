import { platformApi } from "@/lib/platform-axios";
import type {
  ComplianceControlDetail,
  ComplianceFramework,
  ComplianceFrameworkSummary,
} from "@/types/platform/compliance-api.types";

export const complianceService = {
  listFrameworks: async (): Promise<ComplianceFrameworkSummary[]> => {
    const res = await platformApi.get<ComplianceFrameworkSummary[]>("/compliance/frameworks");
    return res.data;
  },

  getFramework: async (id: string): Promise<ComplianceFramework> => {
    const res = await platformApi.get<ComplianceFramework>(`/compliance/frameworks/${id}`);
    return res.data;
  },

  getControl: async (id: string): Promise<ComplianceControlDetail> => {
    const res = await platformApi.get<ComplianceControlDetail>(`/compliance/controls/${id}`);
    return res.data;
  },
};
