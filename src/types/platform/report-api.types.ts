export type ReportType =
  | "SECURITY_POSTURE"
  | "RISK_ASSESSMENT"
  | "DECISION_SUMMARY"
  | "THREAT_INTELLIGENCE"
  | "EXECUTIVE_SUMMARY"
  | "COMPLIANCE";

export type ReportStatus = "GENERATED" | "IN_REVIEW" | "APPROVED" | "LOCKED" | "PUBLISHED";

export interface Report {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  reportType: ReportType;
  status: ReportStatus;
  currentVersion: number;
  dateFrom: string | null;
  dateTo: string | null;
  summaryMetrics: Record<string, unknown>;
  generatedByUserId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSection {
  heading: string;
  body: string;
}

export interface ReportVersionContent {
  sections: ReportSection[];
  generatedAt: string;
}

export interface ReportVersion {
  id: string;
  organizationId: string;
  reportId: string;
  versionNumber: number;
  content: ReportVersionContent;
  contentHash: string;
  createdByUserId: string;
  correctionNote: string | null;
  createdAt: string;
}

export interface ReportVersionMeta {
  id: string;
  versionNumber: number;
  contentHash: string;
  createdByUserId: string;
  correctionNote: string | null;
  createdAt: string;
}

export interface ReportWithVersions extends Report {
  versions: ReportVersion[];
}

export interface ReportListParams {
  status?: ReportStatus;
  reportType?: ReportType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GenerateReportRequest {
  reportType: ReportType;
  title: string;
  description?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateReportStatusRequest {
  status: ReportStatus;
  correctionNote?: string;
}

export interface ReportStatusResponse {
  report?: Report;
  correction?: {
    reportId: string;
    status: "GENERATED";
    version: number;
  };
}

export const REPORT_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  GENERATED: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "GENERATED"],
  APPROVED: ["LOCKED"],
  LOCKED: ["PUBLISHED"],
  PUBLISHED: [],
};
