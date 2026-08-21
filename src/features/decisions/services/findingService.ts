import findingsData from "@/mock-data/findings.json";
import type { FindingsData } from "@/types/finding.types";

export const findingService = async (): Promise<FindingsData> => {
  return findingsData as unknown as FindingsData;
};
