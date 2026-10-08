"use client";

import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../services/analyticsService";

export const useAnalytics = (days: number = 14) => {
  return useQuery({
    queryKey: ["analytics", days],
    queryFn: () => analyticsService(days),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
