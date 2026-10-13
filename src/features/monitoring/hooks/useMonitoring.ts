"use client";

import { useQuery } from "@tanstack/react-query";

import { getMonitoringData } from "../services/monitoringService";

export const useMonitoring = () => {
  return useQuery({
    queryKey: ["monitoring"],
    queryFn: getMonitoringData,
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};
