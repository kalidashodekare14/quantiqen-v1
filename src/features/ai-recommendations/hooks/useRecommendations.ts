"use client"
import { useQuery } from "@tanstack/react-query"
import { recommendationService } from "../services/recommendation.service"

export const useRecommendations = () => {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: recommendationService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })
}
