import { platformApi } from "@/lib/platform-axios";
import type {
  CreateScanPolicyRequest,
  ScanJob,
  ScanJobDetail,
  ScanPolicyListItem,
  ScanResult,
  ScanStatus,
  TriggerScanRequest,
  TriggerScanResponse,
  UpdateScanPolicyRequest,
} from "@/types/platform/scan-api.types";

export const scanService = {
  listPolicies: async (): Promise<ScanPolicyListItem[]> => {
    const res = await platformApi.get<ScanPolicyListItem[]>("/scans/policies");
    return res.data;
  },

  createPolicy: async (body: CreateScanPolicyRequest): Promise<ScanPolicyListItem> => {
    const res = await platformApi.post<ScanPolicyListItem>("/scans/policies", body);
    return res.data;
  },

  updatePolicy: async (
    id: string,
    body: UpdateScanPolicyRequest,
  ): Promise<ScanPolicyListItem> => {
    const res = await platformApi.patch<ScanPolicyListItem>(`/scans/policies/${id}`, body);
    return res.data;
  },

  deletePolicy: async (id: string): Promise<void> => {
    await platformApi.delete(`/scans/policies/${id}`);
  },

  trigger: async (body: TriggerScanRequest): Promise<TriggerScanResponse> => {
    const res = await platformApi.post<TriggerScanResponse>("/scans/trigger", body);
    return res.data;
  },

  listJobs: async (status?: ScanStatus): Promise<ScanJob[]> => {
    const res = await platformApi.get<ScanJob[]>("/scans/jobs", {
      params: status ? { status } : undefined,
    });
    return res.data;
  },

  getJob: async (id: string): Promise<ScanJobDetail> => {
    const res = await platformApi.get<ScanJobDetail>(`/scans/jobs/${id}`);
    return res.data;
  },

  getResults: async (jobId: string): Promise<ScanResult[]> => {
    const res = await platformApi.get<ScanResult[]>(`/scans/results/${jobId}`);
    return res.data;
  },
};
