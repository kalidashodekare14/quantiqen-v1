// @mock-retained - no platform/identity endpoint exists for this data; parked intentionally.
import recommendationsData from "@/mock-data/recommendations.json"
import { RecommendationsData } from "@/types/recommendation.types"

export const recommendationService = async (): Promise<RecommendationsData> => {
  return recommendationsData as unknown as RecommendationsData
}
