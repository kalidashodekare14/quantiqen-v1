"use client"
import { useQuery } from "@tanstack/react-query"
import { analyticsService } from "../services/analyticsService"

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })
}
