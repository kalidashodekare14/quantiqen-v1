import { aiApi } from "@/lib/axios"
import type {
  AIDecisionRequest,
  AIDecisionResponse,
  AIHealthResponse,
  AIReadyResponse,
} from "@/types/ai-engine.types"

export const checkHealth = async (): Promise<AIHealthResponse> => {
  const res = await aiApi.get("/health")
  return res.data
}

export const checkReady = async (): Promise<AIReadyResponse> => {
  const res = await aiApi.get("/ready")
  return res.data
}

export const getSingleDecision = async (
  payload: AIDecisionRequest
): Promise<AIDecisionResponse> => {
  const res = await aiApi.post("/api/v1/decisions", payload)
  return res.data
}

export const getBatchDecision = async (
  payload: AIDecisionRequest
): Promise<AIDecisionResponse> => {
  const res = await aiApi.post("/api/v1/decisions/batch", payload)
  return res.data
}
