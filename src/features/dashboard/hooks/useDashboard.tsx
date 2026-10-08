"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../services/dashboard.service";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
