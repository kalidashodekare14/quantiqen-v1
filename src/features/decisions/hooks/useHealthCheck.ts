"use client";

import { useQuery } from "@tanstack/react-query";

import { platformApi } from "@/lib/platform-axios";
import type { SystemHealth } from "@/types/platform/health.types";

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const res = await platformApi.get<SystemHealth>("/system/health");
      return res.data;
    },
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 3000,
  });
};
