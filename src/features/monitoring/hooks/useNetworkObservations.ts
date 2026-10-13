"use client";

import { useQuery } from "@tanstack/react-query";

import { networkObservationService } from "../services/networkObservation.service";
import type { NetworkObservationParams } from "@/types/platform/network-observation.types";

export const useNetworkObservations = (params: NetworkObservationParams) => {
  return useQuery({
    queryKey: ["network-observations", params],
    queryFn: () => networkObservationService.list(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
};

export const useNetworkObservationDetail = (id?: string) => {
  return useQuery({
    queryKey: ["network-observation", id],
    queryFn: () => networkObservationService.getById(id as string),
    enabled: Boolean(id),
    staleTime: 15000,
  });
};
