"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { situationService } from "../services/situation.service";
import type {
  SituationParams,
  UpdateSituationStatusRequest,
} from "@/types/platform/situation.types";

export const useSituations = (params: SituationParams) => {
  return useQuery({
    queryKey: ["situations", params],
    queryFn: () => situationService.list(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
};

export const useSituationDetail = (id?: string) => {
  return useQuery({
    queryKey: ["situation", id],
    queryFn: () => situationService.getById(id as string),
    enabled: Boolean(id),
    staleTime: 15000,
  });
};

export const useUpdateSituationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSituationStatusRequest }) =>
      situationService.updateStatus(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["situations"] });
      queryClient.invalidateQueries({ queryKey: ["situation"] });
    },
  });
};
