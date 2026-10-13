export type PolicyField =
  | "risk_score"
  | "tier"
  | "priority"
  | "asset_criticality"
  | "data_sensitivity"
  | "environment"
  | "finding_type"
  | "situation_severity";

export type PolicyOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in";

export type PolicyAction = "REQUIRE_APPROVAL" | "AUTO_APPROVE" | "BLOCK" | "ESCALATE";

export type PolicyType =
  | "SECURITY_GUARDRAIL"
  | "REGULATORY"
  | "ORG_POLICY"
  | "ASSET_POLICY"
  | "ENVIRONMENT_POLICY"
  | "DETERMINISTIC_RULE";

export type PolicySeverity = "MANDATORY" | "RECOMMENDED" | "ADVISORY";

export type PolicyStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type PolicyRuleValue = number | string | Array<number | string>;

export interface PolicyRule {
  field: PolicyField;
  operator: PolicyOperator;
  value: PolicyRuleValue;
  action: PolicyAction;
  message: string;
}

export interface PolicyVersionSummary {
  id: string;
  versionNumber: number;
  rulesSnapshot: PolicyRule[];
  changeReason: string;
  createdAt: string;
}

export interface Policy {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  policyType: PolicyType;
  severity: PolicySeverity;
  status: PolicyStatus;
  rules: PolicyRule[];
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  versions?: PolicyVersionSummary[];
  _count?: { evaluations: number };
}

export interface PolicyVersion {
  id: string;
  policyId?: string;
  versionNumber: number;
  rulesSnapshot: PolicyRule[];
  changeReason: string;
  createdByUserId: string;
  createdAt: string;
  policy?: { id: string; name: string };
}

export interface PolicyListParams {
  status?: PolicyStatus;
}

export interface CreatePolicyRequest {
  name: string;
  description?: string;
  policyType: PolicyType;
  severity?: PolicySeverity;
  rules: PolicyRule[];
}

export interface UpdatePolicyRequest {
  name?: string;
  description?: string;
  rules?: PolicyRule[];
}
