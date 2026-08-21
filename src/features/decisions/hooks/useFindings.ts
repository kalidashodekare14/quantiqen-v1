"use client";

import { useQuery } from "@tanstack/react-query";
import { findingService } from "../services/findingService";

export const useFindings = () => {
  return useQuery({
    queryKey: ["findings"],
    queryFn: findingService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
