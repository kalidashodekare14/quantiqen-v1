export interface Recommendation {
  id: string
  recommendation: string
  businessImpact: "Low" | "Medium" | "High" | "Critical"
  priority: "Low" | "Medium" | "High" | "Critical"
  confidence: number
  estimatedFixTime: string
  responsibleTeam: string
  status: "Pending" | "In Progress"
}

export interface RecommendationMeta {
  total: number
  pending: number
  inProgress: number
}

export interface RecommendationsData {
  recommendations: Recommendation[]
  meta: RecommendationMeta
}
