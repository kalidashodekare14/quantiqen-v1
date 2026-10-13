"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { API_USAGE_QUERY_KEY, useApiUsage } from "@/hooks/use-api-usage";
import { apiManagementService } from "../services/apiManagement.service";
import type { ApiKey, CreateApiKeyRequest } from "@/types/platform/api-key.types";

export { useApiUsage };

export const useApiManagement = () => {
  return useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: apiManagementService.list,
    staleTime: 30000,
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
      queryClient.invalidateQueries({ queryKey: API_USAGE_QUERY_KEY });
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
