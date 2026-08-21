import { api } from "@/lib/axios";
import type {
  AIDecisionRequest,
  AIDecisionResponse,
  AIHealthResponse,
  AIReadyResponse,
} from "@/types/ai-engine.types";

export const checkHealth = async (): Promise<AIHealthResponse> => {
  const res = await api.get("/health");
  return res.data;
};

export const checkReady = async (): Promise<AIReadyResponse> => {
  const res = await api.get("/ready");
  return res.data;
};

export const getSingleDecision = async (
  payload: AIDecisionRequest,
): Promise<AIDecisionResponse> => {
  const res = await api.post("/ai/decision", payload);
  return res.data;
};

export const getBatchDecision = async (payload: AIDecisionRequest): Promise<AIDecisionResponse> => {
  const res = await api.post("/ai/decision/batch", payload);
  return res.data;
};
