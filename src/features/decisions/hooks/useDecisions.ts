"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { decisionService } from "../services/decisionService";
import type {
  AnalyzeDecisionsResponse,
  ApproveDecisionRequest,
  AssignDecisionOwnerResponse,
  CorrectionListResponse,
  CreateCorrectionRequest,
  DecisionListParams,
  DecisionStatusResult,
  DecisionStatusTransitionResult,
  DecisionTeamAssignment,
  ReopenDecisionRequest,
  RejectDecisionRequest,
  SubmitRemediationRequest,
  SubmitRemediationResponse,
  SubmitVerificationRequest,
  SubmitVerificationResponse,
  UpdateDecisionStatusRequest,
} from "@/types/platform/decision-api.types";

interface UseDecisionsOptions {
  refetchInterval?: number | false | (() => number | false);
}

export const useDecisions = (params: DecisionListParams, options?: UseDecisionsOptions) => {
  return useQuery({
    queryKey: ["decisions", params],
    queryFn: () => decisionService.list(params),
    staleTime: 15000,
    refetchOnWindowFocus: false,
    refetchInterval: options?.refetchInterval,
  });
};

export const useDecisionDetail = (id?: string) => {
  return useQuery({
    queryKey: ["decision", id],
    queryFn: () => decisionService.getById(id as string),
    enabled: Boolean(id),
    staleTime: 15000,
  });
};

export const useDecisionNotes = (id?: string) => {
  return useQuery({
    queryKey: ["decision-notes", id],
    queryFn: () => decisionService.listNotes(id as string),
    enabled: Boolean(id),
    staleTime: 15000,
  });
};

export const useDecisionRemediations = (id?: string) => {
  return useQuery({
    queryKey: ["decision-remediations", id],
    queryFn: () => decisionService.listRemediations(id as string),
    enabled: Boolean(id),
    staleTime: 15000,
  });
};

export const useDecisionVerifications = (id?: string) => {
  return useQuery({
    queryKey: ["decision-verifications", id],
    queryFn: () => decisionService.listVerifications(id as string),
    enabled: Boolean(id),
    staleTime: 15000,
  });
};

export const useDecisionCorrections = (evidenceId?: string) => {
  return useQuery<CorrectionListResponse>({
    queryKey: ["decision-corrections", evidenceId],
    queryFn: () => decisionService.listCorrections(evidenceId as string),
    enabled: Boolean(evidenceId),
    staleTime: 15000,
  });
};

const useInvalidatedDecisionMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    invalidateList?: boolean;
    invalidateDetail?: boolean;
    onSuccess?: (data: TData, variables: TVariables) => void;
  },
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (options?.invalidateList !== false) {
        queryClient.invalidateQueries({ queryKey: ["decisions"] });
      }
      if (options?.invalidateDetail !== false) {
        queryClient.invalidateQueries({ queryKey: ["decision"] });
      }
      options?.onSuccess?.(data, variables);
    },
  });
};

export const useAnalyzeDecisions = () => {
  return useInvalidatedDecisionMutation<void, AnalyzeDecisionsResponse>(
    () => decisionService.analyze(),
  );
};

export const useApproveDecision = () => {
  return useInvalidatedDecisionMutation<
    { id: string; body: ApproveDecisionRequest },
    DecisionStatusResult
  >(({ id, body }) => decisionService.approve(id, body));
};

export const useRejectDecision = () => {
  return useInvalidatedDecisionMutation<
    { id: string; body: RejectDecisionRequest },
    DecisionStatusResult
  >(({ id, body }) => decisionService.reject(id, body));
};

export const useUpdateDecisionStatus = () => {
  return useInvalidatedDecisionMutation<
    { id: string; body: UpdateDecisionStatusRequest },
    DecisionStatusTransitionResult
  >(({ id, body }) => decisionService.updateStatus(id, body));
};

export const useReopenDecision = () => {
  return useInvalidatedDecisionMutation<
    { id: string; body: ReopenDecisionRequest },
    DecisionStatusTransitionResult
  >(({ id, body }) => decisionService.reopen(id, body));
};

export const useAssignDecisionOwner = () => {
  return useInvalidatedDecisionMutation<
    { id: string; assignedToUserId: string },
    AssignDecisionOwnerResponse
  >(({ id, assignedToUserId }) => decisionService.assignOwner(id, { assignedToUserId }));
};

export const useAssignDecisionTeam = () => {
  return useInvalidatedDecisionMutation<
    { id: string; teamId: string; reason?: string },
    DecisionTeamAssignment
  >(({ id, teamId, reason }) => decisionService.assignTeam(id, { teamId, reason }));
};

export const useCreateDecisionNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      decisionService.createNote(id, { body }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["decision-notes", variables.id] });
    },
  });
};

export const useUpdateDecisionNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, noteId, body }: { id: string; noteId: string; body: string }) =>
      decisionService.updateNote(id, noteId, { body }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["decision-notes", variables.id] });
    },
  });
};

export const useSubmitRemediation = () => {
  return useInvalidatedDecisionMutation<
    { id: string; body: SubmitRemediationRequest },
    SubmitRemediationResponse
  >(({ id, body }) => decisionService.submitRemediation(id, body), {
    invalidateList: false,
  });
};

export const useSubmitVerification = () => {
  return useInvalidatedDecisionMutation<
    { id: string; body: SubmitVerificationRequest },
    SubmitVerificationResponse
  >(({ id, body }) => decisionService.submitVerification(id, body), {
    invalidateList: false,
  });
};

export const useCreateCorrection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCorrectionRequest) => decisionService.createCorrection(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision-corrections"] });
      queryClient.invalidateQueries({ queryKey: ["decision-remediations"] });
      queryClient.invalidateQueries({ queryKey: ["decision-verifications"] });
    },
  });
};
