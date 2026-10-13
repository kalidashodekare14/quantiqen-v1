"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reportService } from "../services/reportService";
import type {
  GenerateReportRequest,
  ReportListParams,
  UpdateReportStatusRequest,
} from "@/types/platform/report-api.types";

export const useReports = (params: ReportListParams = {}) => {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => reportService.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useReportDetail = (id?: string) => {
  return useQuery({
    queryKey: ["report", id],
    queryFn: () => reportService.getById(id as string),
    enabled: Boolean(id),
    staleTime: 30000,
  });
};

export const useReportVersions = (id?: string) => {
  return useQuery({
    queryKey: ["report-versions", id],
    queryFn: () => reportService.listVersions(id as string),
    enabled: Boolean(id),
    staleTime: 30000,
  });
};

export const useReportVersion = (reportId?: string, versionId?: string) => {
  return useQuery({
    queryKey: ["report-version", reportId, versionId],
    queryFn: () => reportService.getVersion(reportId as string, versionId as string),
    enabled: Boolean(reportId && versionId),
    staleTime: 30000,
  });
};

const useReportInvalidation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      queryClient.invalidateQueries({ queryKey: ["report-versions"] });
      queryClient.invalidateQueries({ queryKey: ["report-version"] });
    },
  });
};

export const useGenerateReport = () => {
  return useReportInvalidation((body: GenerateReportRequest) => reportService.generate(body));
};

export const useUpdateReportStatus = () => {
  return useReportInvalidation(
    ({ id, body }: { id: string; body: UpdateReportStatusRequest }) =>
      reportService.updateStatus(id, body),
  );
};
