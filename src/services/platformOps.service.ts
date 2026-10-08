import { platformApi } from "@/lib/platform-axios";
import type {
  CreateIncidentRequest,
  DlqFailuresParams,
  DlqFailuresResponse,
  DlqOverview,
  ReplayResponse,
  StatusResponse,
  SuspensionMetrics,
  SystemHealthResponse,
  SystemIncident,
  UpdateIncidentRequest,
} from "@/types/platform/platform-ops.types";

function cleanParams(params: DlqFailuresParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};
  if (params.queueName) query.queueName = params.queueName;
  if (params.reasonCode) query.reasonCode = params.reasonCode;
  if (params.recoveryPriority) query.recoveryPriority = params.recoveryPriority;
  if (params.recovered !== undefined) query.recovered = params.recovered;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  return query;
}

export const platformOpsService = {
  getStatus: async (): Promise<StatusResponse> => {
    const res = await platformApi.get<StatusResponse>("/status");
    return res.data;
  },

  getHealth: async (): Promise<SystemHealthResponse> => {
    const res = await platformApi.get<SystemHealthResponse>("/system/health");
    return res.data;
  },

  getSuspension: async (): Promise<SuspensionMetrics> => {
    const res = await platformApi.get<SuspensionMetrics>("/system/suspension");
    return res.data;
  },

  getDlqOverview: async (): Promise<DlqOverview> => {
    const res = await platformApi.get<DlqOverview>("/system/dlq");
    return res.data;
  },

  listDlqFailures: async (params: DlqFailuresParams = {}): Promise<DlqFailuresResponse> => {
    const res = await platformApi.get<DlqFailuresResponse>("/system/dlq/failures", {
      params: cleanParams(params),
    });
    return res.data;
  },

  replayFailure: async (id: string, dryRun: boolean): Promise<ReplayResponse> => {
    const res = await platformApi.post<ReplayResponse>(`/system/dlq/${id}/replay`, { dryRun });
    return res.data;
  },

  listIncidents: async (params: {
    severity?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<SystemIncident[]> => {
    const res = await platformApi.get<SystemIncident[]>("/system/incidents", { params });
    return res.data;
  },

  createIncident: async (body: CreateIncidentRequest): Promise<SystemIncident> => {
    const res = await platformApi.post<SystemIncident>("/system/incidents", body);
    return res.data;
  },

  updateIncident: async (id: string, body: UpdateIncidentRequest): Promise<SystemIncident> => {
    const res = await platformApi.patch<SystemIncident>(`/system/incidents/${id}`, body);
    return res.data;
  },
};
