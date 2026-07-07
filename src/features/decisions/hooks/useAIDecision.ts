"use client";

import { useMutation } from "@tanstack/react-query";
import aiResponse from "@/mock-data/ai-response.json";
import type { AIDecisionResponse, AIDecisionRequest } from "@/types/ai-engine.types";

export const useAIDecision = () => {
  return useMutation({
    mutationFn: async (_payload: AIDecisionRequest): Promise<AIDecisionResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return aiResponse as AIDecisionResponse;
    },
  });
};
