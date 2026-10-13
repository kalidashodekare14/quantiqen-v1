import type { Report, ReportVersion } from "@/types/platform/report-api.types";

import {
  NOISE_KEYS,
  formatScalar,
  humanize,
  isRecord,
  normalizeReportContent,
  parseContentRecord,
} from "./report-content";
import { serializeReport } from "./report-download";

export type ReportExportFormat = "md" | "csv" | "pdf";

const SKIPPED_CONTENT_KEYS = new Set(["generatedAt", "sections"]);

function sanitizeFilename(value: string): string {
  return (
    value
      .replace(/[^a-z0-9-_ ]/gi, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "report"
  );
}

function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function csvRow(cells: string[]): string {
  return cells.map(csvEscape).join(",");
}

function isItemRecordArray(value: unknown[]): value is Record<string, unknown>[] {
  return value.length > 0 && value.every(isRecord);
}

function pushArrayTable(rows: string[], key: string, value: unknown[]): void {
  rows.push("", csvRow([`${humanize(key)} (${value.length})`]));

  if (isItemRecordArray(value)) {
    const columns: string[] = [];
    for (const item of value) {
      for (const column of Object.keys(item)) {
        if (!NOISE_KEYS.has(column) && !columns.includes(column)) {
          columns.push(column);
        }
      }
    }

    if (columns.length === 0) return;

    rows.push(csvRow(columns.map(humanize)));
    for (const item of value) {
      rows.push(
        csvRow(columns.map((column) => formatScalar(item[column] as unknown))),
      );
    }
    return;
  }

  rows.push(csvRow([humanize(key)]));
  for (const item of value) {
    rows.push(csvRow([formatScalar(item)]));
  }
}

function buildCsv(report: Report, version: ReportVersion): string {
  const content = normalizeReportContent(version.content);
  const record = parseContentRecord(version.content);
  const rows: string[] = [
    csvRow(["Report", report.title]),
    csvRow(["Description", report.description ?? ""]),
    csvRow(["Type", report.reportType.replaceAll("_", " ")]),
    csvRow(["Status", report.status.replaceAll("_", " ")]),
    csvRow(["Version", String(version.versionNumber)]),
    csvRow(["Generated", content.generatedAt || "—"]),
  ];

  if (report.dateFrom || report.dateTo) {
    rows.push(
      csvRow(["Period", `${report.dateFrom ?? "—"} to ${report.dateTo ?? "—"}`]),
    );
  }

  if (record && Array.isArray(record.sections)) {
    rows.push("", csvRow(["Section", "Content"]));
    for (const section of content.sections) {
      rows.push(csvRow([section.heading, section.body]));
    }
  } else if (record) {
    for (const [key, value] of Object.entries(record)) {
      if (SKIPPED_CONTENT_KEYS.has(key) || NOISE_KEYS.has(key)) continue;
      if (value === null || value === undefined) continue;

      if (Array.isArray(value)) {
        if (value.length === 0) continue;
        pushArrayTable(rows, key, value);
        continue;
      }

      rows.push("", csvRow([humanize(key), formatScalar(value)]));
    }
  }

  return rows.join("\n");
}

async function downloadPdf(
  report: Report,
  version: ReportVersion,
  filename: string,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeWrapped = (
    text: string,
    style: "normal" | "bold",
    size: number,
    color: [number, number, number],
    gap = 6,
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lineHeight = size * 1.45;

    for (const rawLine of text.split(/\r?\n/)) {
      const wrapped = doc.splitTextToSize(rawLine, maxWidth) as string[];
      for (const line of wrapped) {
        ensureSpace(lineHeight);
        doc.text(line, margin, y);
        y += lineHeight;
      }
      if (rawLine === "") y += gap * 0.4;
    }
    y += gap;
  };

  const content = normalizeReportContent(version.content);

  writeWrapped(report.title, "bold", 18, [17, 17, 17], 8);
  if (report.description) {
    writeWrapped(report.description, "normal", 10, [100, 100, 100], 10);
  }

  const metaParts = [
    `Type: ${report.reportType.replaceAll("_", " ")}`,
    `Status: ${report.status.replaceAll("_", " ")}`,
    `Version: ${version.versionNumber}`,
    `Generated: ${content.generatedAt || "—"}`,
  ];
  if (report.dateFrom || report.dateTo) {
    metaParts.push(
      `Period: ${report.dateFrom ?? "—"} to ${report.dateTo ?? "—"}`,
    );
  }
  writeWrapped(metaParts.join("  ·  "), "normal", 9, [130, 130, 130], 12);

  doc.setDrawColor(210, 210, 210);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  if (content.sections.length === 0) {
    writeWrapped(
      "No content available for this version.",
      "normal",
      10,
      [130, 130, 130],
    );
  }

  for (const section of content.sections) {
    writeWrapped(section.heading, "bold", 12, [17, 17, 17], 4);
    writeWrapped(section.body, "normal", 10, [60, 60, 60], 12);
  }

  doc.save(filename);
}

export async function exportReport(
  report: Report,
  version: ReportVersion,
  format: ReportExportFormat,
): Promise<void> {
  const slug = `${sanitizeFilename(report.title)}-v${version.versionNumber}`;

  if (format === "md") {
    downloadTextFile(`${slug}.md`, serializeReport(report, version), "text/markdown");
    return;
  }

  if (format === "csv") {
    downloadTextFile(`${slug}.csv`, buildCsv(report, version), "text/csv");
    return;
  }

  await downloadPdf(report, version, `${slug}.pdf`);
}
