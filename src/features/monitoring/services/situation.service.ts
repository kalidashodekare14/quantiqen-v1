import { platformApi } from "@/lib/platform-axios";
import type {
  SituationDetail,
  SituationListResponse,
  SituationParams,
  UpdateSituationStatusRequest,
  UpdateSituationStatusResponse,
} from "@/types/platform/situation.types";

function cleanParams(params: SituationParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.status) query.status = params.status;
  if (params.severity) query.severity = params.severity;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  return query;
}

export const situationService = {
  list: async (params: SituationParams = {}): Promise<SituationListResponse> => {
    const res = await platformApi.get<SituationListResponse>("/situations", {
      params: cleanParams(params),
    });
    return res.data;
  },

  getById: async (id: string): Promise<SituationDetail> => {
    const res = await platformApi.get<SituationDetail>(`/situations/${id}`);
    return res.data;
  },

  updateStatus: async (
    id: string,
    body: UpdateSituationStatusRequest,
  ): Promise<UpdateSituationStatusResponse> => {
    const res = await platformApi.patch<UpdateSituationStatusResponse>(
      `/situations/${id}/status`,
      body,
    );
    return res.data;
  },
};
