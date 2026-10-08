"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLog.service";
import { platformAuditLogService } from "../services/platformAuditLog.service";
import type { AuditLogParams } from "../types/audit-log.types";
import type { PlatformAuditLogParams } from "@/types/platform/audit-api.types";

export function usePortalAuditLog(params?: AuditLogParams) {
  return useQuery({
    queryKey: ["portal-audit-log", params],
    queryFn: () => auditLogService.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function usePlatformAuditLog(params?: PlatformAuditLogParams) {
  return useQuery({
    queryKey: ["platform-audit-log", params],
    queryFn: () => platformAuditLogService.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
