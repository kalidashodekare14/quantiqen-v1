"use client"

import { useQuery } from "@tanstack/react-query"
import { reportService } from "../services/reportService"

export const useReports = () => {
  return useQuery({
    queryKey: ["reports"],
    queryFn: reportService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })
}
