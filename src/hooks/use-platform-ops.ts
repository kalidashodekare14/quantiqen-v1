"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { platformOpsService } from "@/services/platformOps.service";
import type {
  CreateIncidentRequest,
  DlqFailuresParams,
  UpdateIncidentRequest,
} from "@/types/platform/platform-ops.types";

const STATUS_POLL = 15000;

export const usePlatformStatus = () => {
  return useQuery({
    queryKey: ["platform-status"],
    queryFn: platformOpsService.getStatus,
    staleTime: 5000,
    refetchInterval: STATUS_POLL,
    refetchOnWindowFocus: false,
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: platformOpsService.getHealth,
    staleTime: 5000,
    refetchInterval: STATUS_POLL,
    refetchOnWindowFocus: false,
  });
};

export const useSuspensionMetrics = () => {
  return useQuery({
    queryKey: ["suspension-metrics"],
    queryFn: platformOpsService.getSuspension,
    staleTime: 5000,
    refetchInterval: STATUS_POLL,
    refetchOnWindowFocus: false,
  });
};

export const useDlqOverview = (enabled: boolean) => {
  return useQuery({
    queryKey: ["dlq-overview"],
    queryFn: platformOpsService.getDlqOverview,
    enabled,
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
};

export const useDlqFailures = (params: DlqFailuresParams, enabled: boolean) => {
  return useQuery({
    queryKey: ["dlq-failures", params],
    queryFn: () => platformOpsService.listDlqFailures(params),
    enabled,
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
};

export const useReplayFailure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dryRun }: { id: string; dryRun: boolean }) =>
      platformOpsService.replayFailure(id, dryRun),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dlq-overview"] });
      queryClient.invalidateQueries({ queryKey: ["dlq-failures"] });
    },
  });
};

export const useIncidents = (params: {
  severity?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ["system-incidents", params],
    queryFn: () => platformOpsService.listIncidents(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
};

const useIncidentInvalidation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["system-incidents"] }),
  });
};

export const useCreateIncident = () => {
  return useIncidentInvalidation((body: CreateIncidentRequest) =>
    platformOpsService.createIncident(body),
  );
};

export const useUpdateIncident = () => {
  return useIncidentInvalidation(
    ({ id, body }: { id: string; body: UpdateIncidentRequest }) =>
      platformOpsService.updateIncident(id, body),
  );
};
