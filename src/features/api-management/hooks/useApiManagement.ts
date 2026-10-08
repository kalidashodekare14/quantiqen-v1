"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiManagementService } from "../services/apiManagement.service";
import type { ApiUsageRow } from "@/types/platform/analytics-api.types";
import type { ApiKey, CreateApiKeyRequest } from "@/types/platform/api-key.types";

export const useApiManagement = () => {
  return useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: apiManagementService.list,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useApiUsage = () => {
  return useQuery<ApiUsageRow[]>({
    queryKey: ["api-usage"],
    queryFn: apiManagementService.getDailyUsage,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

const useApiKeyMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["api-usage"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useCreateApiKey = () => {
  return useApiKeyMutation((body: CreateApiKeyRequest) => apiManagementService.create(body));
};

export const useRotateApiKey = () => {
  return useApiKeyMutation((id: string) => apiManagementService.rotate(id));
};

export const useDeleteApiKey = () => {
  return useApiKeyMutation((id: string) => apiManagementService.remove(id));
};
