import recommendationsData from "@/mock-data/recommendations.json"
import { RecommendationsData } from "@/types/recommendation.types"

export const recommendationService = async (): Promise<RecommendationsData> => {
  return recommendationsData as unknown as RecommendationsData
}
