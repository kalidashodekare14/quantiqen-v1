import type { Report, ReportVersion } from "@/types/platform/report-api.types";

import { normalizeReportContent } from "./report-content";

export function serializeReport(report: Report, version: ReportVersion): string {
  const content = normalizeReportContent(version.content);
  const lines: string[] = [
    `# ${report.title}`,
    "",
    report.description ?? "",
    "",
    `Type: ${report.reportType.replaceAll("_", " ")}`,
    `Status: ${report.status.replaceAll("_", " ")}`,
    `Version: ${version.versionNumber}`,
    `Generated: ${content.generatedAt || "—"}`,
    report.dateFrom || report.dateTo
      ? `Period: ${report.dateFrom ?? "—"} to ${report.dateTo ?? "—"}`
      : "",
    "",
    "---",
    "",
  ];

  for (const section of content.sections) {
    lines.push(`## ${section.heading}`, "", section.body, "");
  }

  return lines.filter((line, index, arr) => !(line === "" && arr[index - 1] === "")).join("\n");
}
