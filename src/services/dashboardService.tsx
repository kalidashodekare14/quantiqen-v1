"use client";
import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const DashboardService = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard.json");
      return res.data;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
