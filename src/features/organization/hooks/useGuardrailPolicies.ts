"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { guardrailPolicyService } from "../services/guardrailPolicy.service";
import type {
  CreatePolicyRequest,
  PolicyListParams,
  UpdatePolicyRequest,
} from "@/types/platform/policy-api.types";

export const usePolicies = (params?: PolicyListParams) => {
  return useQuery({
    queryKey: ["policies", params],
    queryFn: () => guardrailPolicyService.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const usePolicyDetail = (id?: string) => {
  return useQuery({
    queryKey: ["policy", id],
    queryFn: () => guardrailPolicyService.getById(id as string),
    enabled: Boolean(id),
    staleTime: 30000,
  });
};

export const usePolicyVersion = (policyId?: string, versionId?: string) => {
  return useQuery({
    queryKey: ["policy-version", policyId, versionId],
    queryFn: () => guardrailPolicyService.getVersion(policyId as string, versionId as string),
    enabled: Boolean(policyId && versionId),
    staleTime: 30000,
  });
};

const usePolicyInvalidation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["policy"] });
      queryClient.invalidateQueries({ queryKey: ["policy-version"] });
    },
  });
};

export const useCreatePolicy = () => {
  return usePolicyInvalidation((body: CreatePolicyRequest) =>
    guardrailPolicyService.create(body),
  );
};

export const useUpdatePolicy = () => {
  return usePolicyInvalidation(({ id, body }: { id: string; body: UpdatePolicyRequest }) =>
    guardrailPolicyService.update(id, body),
  );
};

export const useActivatePolicy = () => {
  return usePolicyInvalidation(({ id, changeReason }: { id: string; changeReason?: string }) =>
    guardrailPolicyService.activate(id, changeReason),
  );
};

export const useArchivePolicy = () => {
  return usePolicyInvalidation((id: string) => guardrailPolicyService.archive(id));
};
