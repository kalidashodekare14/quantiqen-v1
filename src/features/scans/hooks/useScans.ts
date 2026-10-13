"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { scanService } from "../services/scan.service";
import type {
  CreateScanPolicyRequest,
  ScanStatus,
  TriggerScanRequest,
  UpdateScanPolicyRequest,
} from "@/types/platform/scan-api.types";

export const useScanPolicies = () => {
  return useQuery({
    queryKey: ["scan-policies"],
    queryFn: scanService.listPolicies,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useScanJobs = (status?: ScanStatus) => {
  return useQuery({
    queryKey: ["scan-jobs", status],
    queryFn: () => scanService.listJobs(status),
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
};

export const useScanJob = (id?: string) => {
  return useQuery({
    queryKey: ["scan-job", id],
    queryFn: () => scanService.getJob(id as string),
    enabled: Boolean(id),
    staleTime: 15000,
  });
};

const useScanInvalidation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scan-policies"] });
      queryClient.invalidateQueries({ queryKey: ["scan-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["scan-job"] });
    },
  });
};

export const useCreateScanPolicy = () => {
  return useScanInvalidation((body: CreateScanPolicyRequest) => scanService.createPolicy(body));
};

export const useUpdateScanPolicy = () => {
  return useScanInvalidation(({ id, body }: { id: string; body: UpdateScanPolicyRequest }) =>
    scanService.updatePolicy(id, body),
  );
};

export const useDeleteScanPolicy = () => {
  return useScanInvalidation((id: string) => scanService.deletePolicy(id));
};

export const useTriggerScan = () => {
  return useScanInvalidation((body: TriggerScanRequest) => scanService.trigger(body));
};
