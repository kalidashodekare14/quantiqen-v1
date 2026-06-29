import decisionsData from "@/mock-data/decisions.json";
import { DecisionsData } from "@/types/decision.types";

export const decisionService = async (): Promise<DecisionsData> => {
  return decisionsData as unknown as DecisionsData;
};
