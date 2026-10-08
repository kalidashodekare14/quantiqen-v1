import type { Report, ReportVersion } from "@/types/platform/report-api.types";

export function serializeReport(report: Report, version: ReportVersion): string {
  const lines: string[] = [
    `# ${report.title}`,
    "",
    report.description ?? "",
    "",
    `Type: ${report.reportType.replaceAll("_", " ")}`,
    `Status: ${report.status.replaceAll("_", " ")}`,
    `Version: ${version.versionNumber}`,
    `Generated: ${version.content.generatedAt}`,
    report.dateFrom || report.dateTo
      ? `Period: ${report.dateFrom ?? "—"} to ${report.dateTo ?? "—"}`
      : "",
    "",
    "---",
    "",
  ];

  for (const section of version.content.sections) {
    lines.push(`## ${section.heading}`, "", section.body, "");
  }

  return lines.filter((line, index, arr) => !(line === "" && arr[index - 1] === "")).join("\n");
}

function sanitizeFilename(value: string): string {
  return (
    value
      .replace(/[^a-z0-9-_ ]/gi, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "report"
  );
}

export function downloadReport(report: Report, version: ReportVersion): void {
  const content = serializeReport(report, version);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFilename(report.title)}-v${version.versionNumber}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
