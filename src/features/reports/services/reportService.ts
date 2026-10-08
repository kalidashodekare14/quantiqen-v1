import { platformApi } from "@/lib/platform-axios";
import type {
  GenerateReportRequest,
  Report,
  ReportListParams,
  ReportListResponse,
  ReportVersion,
  ReportVersionMeta,
  ReportWithVersions,
  UpdateReportStatusRequest,
} from "@/types/platform/report-api.types";

function cleanParams(params: ReportListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.status) query.status = params.status;
  if (params.reportType) query.reportType = params.reportType;
  if (params.dateFrom) query.dateFrom = params.dateFrom;
  if (params.dateTo) query.dateTo = params.dateTo;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  return query;
}

export const reportService = {
  list: async (params: ReportListParams = {}): Promise<ReportListResponse> => {
    const res = await platformApi.get<ReportListResponse>("/reports", {
      params: cleanParams(params),
    });
    return res.data;
  },

  getById: async (id: string): Promise<ReportWithVersions> => {
    const res = await platformApi.get<ReportWithVersions>(`/reports/${id}`);
    return res.data;
  },

  listVersions: async (id: string): Promise<ReportVersionMeta[]> => {
    const res = await platformApi.get<ReportVersionMeta[]>(`/reports/${id}/versions`);
    return res.data;
  },

  getVersion: async (reportId: string, versionId: string): Promise<ReportVersion> => {
    const res = await platformApi.get<ReportVersion>(
      `/reports/${reportId}/versions/${versionId}`,
    );
    return res.data;
  },

  generate: async (body: GenerateReportRequest): Promise<Report> => {
    const res = await platformApi.post<Report>("/reports/generate", body);
    return res.data;
  },

  updateStatus: async (
    id: string,
    body: UpdateReportStatusRequest,
  ): Promise<Report | { reportId: string; status: "GENERATED"; version: number }> => {
    const res = await platformApi.patch<Report | { reportId: string; status: "GENERATED"; version: number }>(
      `/reports/${id}/status`,
      body,
    );
    return res.data;
  },
};
