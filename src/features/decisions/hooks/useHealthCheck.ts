"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await api.get("/health");
      return res.data;
    },
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 3000,
  });
};
