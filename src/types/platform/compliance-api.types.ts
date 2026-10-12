export type ControlStatus = "MAPPED" | "PARTIAL" | "GAP" | "NOT_APPLICABLE";

export interface ComplianceFrameworkSummary {
  id: string;
  framework: string;
  version: string;
  controlCount: number;
  createdAt: string;
}

export interface ComplianceControl {
  id: string;
  organizationId: string;
  frameworkId: string;
  controlId: string;
  controlName: string;
  description: string;
  status: ControlStatus;
  findingIds: string[] | null;
  evidenceIds: string[] | null;
  remediationIds: string[] | null;
  lastAssessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceFrameworkMeta {
  id: string;
  organizationId: string;
  framework: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceFramework extends ComplianceFrameworkMeta {
  controls: ComplianceControl[] | null;
}

export interface ComplianceControlDetail extends ComplianceControl {
  framework: ComplianceFrameworkMeta | null;
}
