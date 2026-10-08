import { platformApi } from "@/lib/platform-axios";
import type {
  NetworkObservationDetail,
  NetworkObservationListResponse,
  NetworkObservationParams,
} from "@/types/platform/network-observation.types";

function cleanParams(params: NetworkObservationParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.observationType) query.observationType = params.observationType;
  if (params.severity) query.severity = params.severity;
  if (params.status) query.status = params.status;
  if (params.assetId) query.assetId = params.assetId;
  if (params.sourceIp) query.sourceIp = params.sourceIp;
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  return query;
}

export const networkObservationService = {
  list: async (
    params: NetworkObservationParams = {},
  ): Promise<NetworkObservationListResponse> => {
    const res = await platformApi.get<NetworkObservationListResponse>("/network-observations", {
      params: cleanParams(params),
    });
    return res.data;
  },

  getById: async (id: string): Promise<NetworkObservationDetail> => {
    const res = await platformApi.get<NetworkObservationDetail>(`/network-observations/${id}`);
    return res.data;
  },
};
