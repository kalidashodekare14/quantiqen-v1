import type {
  ReportContentRaw,
  ReportSection,
  ReportVersionContent,
} from "@/types/platform/report-api.types";

const GENERATED_AT_KEY = "generatedAt";
const SECTIONS_KEY = "sections";

export const NOISE_KEYS = new Set([
  "id",
  "organizationId",
  "reportId",
  "generatedByUserId",
  "createdByUserId",
  "createdAt",
  "updatedAt",
]);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function humanize(key: string): string {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function formatScalar(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  if (value === null || value === undefined) return "—";
  return JSON.stringify(value, null, 2);
}

export function parseContentRecord(
  raw: ReportContentRaw | undefined,
): Record<string, unknown> | null {
  let content: unknown = raw;

  if (typeof content === "string") {
    try {
      content = JSON.parse(content);
    } catch {
      return null;
    }
  }

  return isRecord(content) ? content : null;
}

function formatArrayItem(item: unknown): string {
  if (!isRecord(item)) return formatScalar(item);
  const parts = Object.entries(item)
    .filter(([key, value]) => !NOISE_KEYS.has(key) && value !== null && value !== undefined)
    .map(([, value]) => formatScalar(value));
  return parts.length > 0 ? parts.join(" · ") : JSON.stringify(item);
}

function sectionsFromList(raw: unknown[]): ReportSection[] {
  return raw.map((entry) => {
    if (!isRecord(entry)) {
      return { heading: "Section", body: formatScalar(entry) };
    }
    const heading =
      typeof entry.heading === "string" && entry.heading.trim() ? entry.heading : "Section";
    const body =
      typeof entry.body === "string"
        ? entry.body
        : formatScalar(entry.body !== undefined ? entry.body : entry);
    return { heading, body };
  });
}

function sectionsFromRecord(content: Record<string, unknown>): ReportSection[] {
  const sections: ReportSection[] = [];

  for (const [key, value] of Object.entries(content)) {
    if (key === GENERATED_AT_KEY || key === SECTIONS_KEY || NOISE_KEYS.has(key)) continue;
    if (value === null || value === undefined) continue;

    const heading = humanize(key);

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      sections.push({ heading, body: value.map(formatArrayItem).join("\n") });
      continue;
    }

    sections.push({ heading, body: formatScalar(value) });
  }

  return sections;
}

export function normalizeReportContent(
  raw: ReportContentRaw | undefined,
): ReportVersionContent {
  const content = parseContentRecord(raw);

  if (!content) {
    return { sections: [], generatedAt: "" };
  }

  const generatedAt =
    typeof content.generatedAt === "string" ? content.generatedAt : "";

  if (Array.isArray(content.sections)) {
    return { sections: sectionsFromList(content.sections), generatedAt };
  }

  return { sections: sectionsFromRecord(content), generatedAt };
}
