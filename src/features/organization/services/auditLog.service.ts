import { api } from "@/lib/axios";
import type { AuditLogResponse, AuditLogParams } from "../types/audit-log.types";

export const auditLogService = {
  list: async (params?: AuditLogParams): Promise<AuditLogResponse> => {
    const res = await api.get("/api/v1/portal/audit-log", { params });
    return res.data;
  },
};
