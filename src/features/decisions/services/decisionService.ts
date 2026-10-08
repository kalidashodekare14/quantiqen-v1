import { platformApi } from "@/lib/platform-axios";
import type {
  AnalyzeDecisionsResponse,
  ApproveDecisionRequest,
  AssignDecisionOwnerRequest,
  AssignDecisionOwnerResponse,
  AssignDecisionTeamRequest,
  Correction,
  CorrectionListResponse,
  CreateCorrectionRequest,
  CreateCorrectionResponse,
  DecisionDetail,
  DecisionListParams,
  DecisionListResponse,
  DecisionNote,
  DecisionStatusResult,
  DecisionTeamAssignment,
  RejectDecisionRequest,
  RemediationListResponse,
  SubmitRemediationRequest,
  SubmitRemediationResponse,
  SubmitVerificationRequest,
  SubmitVerificationResponse,
  VerificationListResponse,
} from "@/types/platform/decision-api.types";

function cleanParams(params: DecisionListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.status) query.status = params.status;
  if (params.severity) query.severity = params.severity;
  if (params.assignedToUserId) query.assignedToUserId = params.assignedToUserId;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  return query;
}

export const decisionService = {
  list: async (params: DecisionListParams = {}): Promise<DecisionListResponse> => {
    const res = await platformApi.get<DecisionListResponse>("/decisions", {
      params: cleanParams(params),
    });
    return res.data;
  },

  getById: async (id: string): Promise<DecisionDetail> => {
    const res = await platformApi.get<DecisionDetail>(`/decisions/${id}`);
    return res.data;
  },

  analyze: async (): Promise<AnalyzeDecisionsResponse> => {
    const res = await platformApi.post<AnalyzeDecisionsResponse>("/decisions/analyze", {});
    return res.data;
  },

  approve: async (id: string, body: ApproveDecisionRequest): Promise<DecisionStatusResult> => {
    const res = await platformApi.post<DecisionStatusResult>(`/decisions/${id}/approve`, body);
    return res.data;
  },

  reject: async (id: string, body: RejectDecisionRequest): Promise<DecisionStatusResult> => {
    const res = await platformApi.post<DecisionStatusResult>(`/decisions/${id}/reject`, body);
    return res.data;
  },

  assignOwner: async (
    id: string,
    body: AssignDecisionOwnerRequest,
  ): Promise<AssignDecisionOwnerResponse> => {
    const res = await platformApi.post<AssignDecisionOwnerResponse>(
      `/decisions/${id}/assign`,
      body,
    );
    return res.data;
  },

  assignTeam: async (
    id: string,
    body: AssignDecisionTeamRequest,
  ): Promise<DecisionTeamAssignment> => {
    const res = await platformApi.post<DecisionTeamAssignment>(
      `/decisions/${id}/assign-team`,
      body,
    );
    return res.data;
  },

  listNotes: async (id: string): Promise<DecisionNote[]> => {
    const res = await platformApi.get<DecisionNote[]>(`/decisions/${id}/notes`);
    return res.data;
  },

  createNote: async (id: string, body: { body: string }): Promise<DecisionNote> => {
    const res = await platformApi.post<DecisionNote>(`/decisions/${id}/notes`, body);
    return res.data;
  },

  updateNote: async (
    id: string,
    noteId: string,
    body: { body: string },
  ): Promise<DecisionNote> => {
    const res = await platformApi.patch<DecisionNote>(`/decisions/${id}/notes/${noteId}`, body);
    return res.data;
  },

  listRemediations: async (id: string): Promise<RemediationListResponse> => {
    const res = await platformApi.get<RemediationListResponse>(`/decisions/${id}/remediation`, {
      params: { limit: 20 },
    });
    return res.data;
  },

  submitRemediation: async (
    id: string,
    body: SubmitRemediationRequest,
  ): Promise<SubmitRemediationResponse> => {
    const res = await platformApi.post<SubmitRemediationResponse>(
      `/decisions/${id}/remediation`,
      body,
    );
    return res.data;
  },

  listVerifications: async (id: string): Promise<VerificationListResponse> => {
    const res = await platformApi.get<VerificationListResponse>(`/decisions/${id}/verification`, {
      params: { limit: 20 },
    });
    return res.data;
  },

  submitVerification: async (
    id: string,
    body: SubmitVerificationRequest,
  ): Promise<SubmitVerificationResponse> => {
    const res = await platformApi.post<SubmitVerificationResponse>(
      `/decisions/${id}/verification`,
      body,
    );
    return res.data;
  },

  listCorrections: async (evidenceId: string): Promise<CorrectionListResponse> => {
    const res = await platformApi.get<CorrectionListResponse>("/corrections", {
      params: { evidenceId, limit: 50 },
    });
    return res.data;
  },

  createCorrection: async (body: CreateCorrectionRequest): Promise<CreateCorrectionResponse> => {
    const res = await platformApi.post<CreateCorrectionResponse>("/corrections", body);
    return res.data;
  },

  getCorrection: async (id: string): Promise<Correction> => {
    const res = await platformApi.get<Correction>(`/corrections/${id}`);
    return res.data;
  },
};
