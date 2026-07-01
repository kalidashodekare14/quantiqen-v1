export type ReportFormat = "PDF" | "CSV" | "DOCX";
export type ReportType = "Executive" | "Technical" | "Compliance" | "Weekly";

export interface Report {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  generatedAt: string;
  size: string;
  format: ReportFormat;
}

export interface ReportMeta {
  total: number;
}

export interface ReportsData {
  reports: Report[];
  meta: ReportMeta;
}
