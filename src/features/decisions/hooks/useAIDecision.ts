"use client";

import { useMutation } from "@tanstack/react-query";
import { getSingleDecision, getBatchDecision } from "@/services/aiEngineService";
import type { AIDecisionRequest } from "@/types/ai-engine.types";

export const useAIDecision = () => {
  return useMutation({
    mutationFn: (payload: AIDecisionRequest) => getSingleDecision(payload),
  });
};

export const useAIBatchDecision = () => {
  return useMutation({
    mutationFn: (payload: AIDecisionRequest) => getBatchDecision(payload),
  });
};
