"use client";

import { useQuery } from "@tanstack/react-query";

import { apiUsageService } from "@/services/api-usage.service";
import type { ApiUsageRow } from "@/types/platform/analytics-api.types";

export const API_USAGE_QUERY_KEY = ["analytics", "api-usage"] as const;

export const useApiUsage = () => {
  return useQuery<ApiUsageRow[]>({
    queryKey: API_USAGE_QUERY_KEY,
    queryFn: apiUsageService.getDailyUsage,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
