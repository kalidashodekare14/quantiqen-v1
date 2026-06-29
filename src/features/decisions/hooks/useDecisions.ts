"use client";

import { useQuery } from "@tanstack/react-query";
import { decisionService } from "../services/decisionService";

export const useDecisions = () => {
  return useQuery({
    queryKey: ["decisions"],
    queryFn: decisionService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
