import type { PaginationMeta } from "@/types/api.types";

export type SituationStatus = "ACTIVE" | "INVESTIGATING" | "RESOLVED" | "CLOSED";

export type PlatformSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface Situation {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  severity: PlatformSeverity;
  status: SituationStatus;
  firstSeenAt: string;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    relations?: number;
    decisions?: number;
  };
}

export interface SituationListResponse extends PaginationMeta {
  situations: Situation[];
}

export interface SituationRelation {
  id: string;
  relatedSituationId: string;
  relationType: string;
  createdAt: string;
}

export interface SituationDecisionRef {
  id: string;
  status: string;
  risk?: {
    tier: string;
    riskScore: number;
  };
}

export interface SituationDetail extends Situation {
  relations: SituationRelation[];
  decisions: SituationDecisionRef[];
}

export interface SituationParams {
  status?: SituationStatus;
  severity?: PlatformSeverity;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface UpdateSituationStatusRequest {
  status: SituationStatus;
}

export interface UpdateSituationStatusResponse {
  id: string;
  title: string;
  status: SituationStatus;
  severity: PlatformSeverity;
  updatedAt: string;
}

export const SITUATION_TRANSITIONS: Record<SituationStatus, SituationStatus[]> = {
  ACTIVE: ["INVESTIGATING", "RESOLVED", "CLOSED"],
  INVESTIGATING: ["RESOLVED", "CLOSED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};
