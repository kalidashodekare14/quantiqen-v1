import { platformApi } from "@/lib/platform-axios";
import type {
  CreatePolicyRequest,
  Policy,
  PolicyListParams,
  PolicyVersion,
  UpdatePolicyRequest,
} from "@/types/platform/policy-api.types";

export const guardrailPolicyService = {
  list: async (params?: PolicyListParams): Promise<Policy[]> => {
    const res = await platformApi.get<Policy[]>("/policies", {
      params: params?.status ? { status: params.status } : undefined,
    });
    return res.data;
  },

  getById: async (id: string): Promise<Policy> => {
    const res = await platformApi.get<Policy>(`/policies/${id}`);
    return res.data;
  },

  getVersion: async (policyId: string, versionId: string): Promise<PolicyVersion> => {
    const res = await platformApi.get<PolicyVersion>(`/policies/${policyId}/versions/${versionId}`);
    return res.data;
  },

  create: async (body: CreatePolicyRequest): Promise<Policy> => {
    const res = await platformApi.post<Policy>("/policies", body);
    return res.data;
  },

  update: async (id: string, body: UpdatePolicyRequest): Promise<Policy> => {
    const res = await platformApi.patch<Policy>(`/policies/${id}`, body);
    return res.data;
  },

  activate: async (id: string, changeReason?: string): Promise<PolicyVersion> => {
    const res = await platformApi.post<PolicyVersion>(
      `/policies/${id}/activate`,
      changeReason ? { changeReason } : {},
    );
    return res.data;
  },

  archive: async (id: string): Promise<Policy> => {
    const res = await platformApi.post<Policy>(`/policies/${id}/archive`, {});
    return res.data;
  },
};
