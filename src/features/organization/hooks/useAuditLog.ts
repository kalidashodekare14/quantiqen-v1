"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLog.service";
import type { AuditLogParams } from "../types/audit-log.types";

export function usePortalAuditLog(params?: AuditLogParams) {
  return useQuery({
    queryKey: ["portal-audit-log", params],
    queryFn: () => auditLogService.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
