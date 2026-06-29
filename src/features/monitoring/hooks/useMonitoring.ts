"use client"
import { useQuery } from "@tanstack/react-query"
import { monitoringService } from "../services/monitoringService"

export const useMonitoring = () => {
  return useQuery({
    queryKey: ["monitoring"],
    queryFn: monitoringService,
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  })
}
