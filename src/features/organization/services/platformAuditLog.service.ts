import { platformApi } from "@/lib/platform-axios";
import type {
  PlatformAuditLogParams,
  PlatformAuditLogResponse,
} from "@/types/platform/audit-api.types";

export const platformAuditLogService = {
  list: async (params?: PlatformAuditLogParams): Promise<PlatformAuditLogResponse> => {
    const res = await platformApi.get<PlatformAuditLogResponse>("/audit-logs", { params });
    return res.data;
  },
};
