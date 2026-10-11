import type { PaginationMeta } from "@/types/api.types";

export type DecisionStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "IN_PROGRESS"
  | "REMEDIATION_SUBMITTED"
  | "RESOLVED"
  | "VERIFIED"
  | "REOPENED"
  | "REJECTED"
  | "EXPIRED";

export type DecisionListStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "EXPIRED";

export type RiskTier = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface DecisionListParams {
  status?: DecisionListStatus;
  severity?: RiskTier;
  assignedToUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface DecisionRiskSummary {
  riskScore: number;
  tier: RiskTier;
  priority: string;
}

export interface DecisionFindingSummary {
  title: string;
  severity: string;
  findingType: string;
}

export interface DecisionListItem {
  id: string;
  status: DecisionStatus;
  createdAt: string;
  updatedAt: string;
  risk: DecisionRiskSummary;
  finding: DecisionFindingSummary;
}

export interface DecisionListResponse extends PaginationMeta {
  decisions: DecisionListItem[];
}

export interface DecisionRecommendation {
  id: string;
  technical_text: string;
  business_explanation: string | null;
  estimated_effort: string;
  estimated_impact: number;
  risk_reduction_potential: number;
  priority: string;
  category: string;
}

export interface DecisionConfidenceFactor {
  factor: string;
  weight: number;
  score: number;
}

export interface DecisionConfidenceDeduction {
  factor: string;
  deduction: number;
}

export interface DecisionConfidenceBreakdown {
  overall_confidence: number;
  categories: Record<string, number>;
  factors: DecisionConfidenceFactor[];
  deductions: DecisionConfidenceDeduction[];
}

export interface DecisionRiskDriver {
  value: number;
  explanation: string;
}

export interface DecisionAiSummaryDetail {
  business_risk: string;
  technical_risk: string;
  why_scored: string;
  immediate_recommendation: string;
  expected_business_impact: string;
}

export interface DecisionRisk {
  id: string;
  riskScore: number;
  tier: RiskTier;
  priority: string;
  confidence: number;
  confidenceBreakdown: DecisionConfidenceBreakdown;
  drivers: Record<string, DecisionRiskDriver>;
  aiSummary: string;
  aiSummaryDetail: DecisionAiSummaryDetail;
  reason: string;
  aiEngineVersion: string;
}

export interface DecisionFinding {
  id: string;
  title: string;
  description: string;
  severity: string;
  findingType: string;
  findingSource: string;
  assetId: string | null;
}

export interface DecisionEngineVersions {
  aiEngine: string;
  riskEngine: string;
  scoring: string;
  knowledge: string;
  policyEngine: string;
  policyVersionId: string;
  aiModelProvider: string;
  aiModelIdentifier: string;
  promptVersion: string;
  inputContextHash: string;
  evaluatedAt: string;
  traceId: string | null;
}

export interface DecisionHistoryItem {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string;
  createdAt: string;
}

export interface DecisionDetail {
  id: string;
  organizationId: string;
  aiEngineDecisionId: string | null;
  status: DecisionStatus;
  assignedToUserId: string | null;
  recommendedAction: string;
  aiDecisionLabel: string;
  recommendation: DecisionRecommendation | null;
  nextAction: string;
  expectedRiskReduction: number;
  estimatedFixTime: string;
  businessOwner: string;
  resolution: string | null;
  SLABreachAt: string | null;
  situationId: string | null;
  contextHash: string;
  contextSnapshot: Record<string, unknown>;
  rulesTriggered: string[];
  policyVersionId: string | null;
  approvalRequired: boolean;
  primaryTeamId: string | null;
  engineVersions: DecisionEngineVersions;
  traceId: string | null;
  createdAt: string;
  updatedAt: string;
  risk: DecisionRisk;
  finding: DecisionFinding;
  history: DecisionHistoryItem[];
}

export interface DecisionNote {
  id: string;
  organizationId: string;
  decisionId: string;
  authorUserId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApproveDecisionRequest {
  note?: string;
}

export interface RejectDecisionRequest {
  reason?: string;
  note?: string;
}

export interface DecisionStatusResult {
  id: string;
  status: DecisionStatus;
}

export interface DecisionStatusTransitionResult {
  id: string;
  status: DecisionStatus;
  fromStatus: DecisionStatus;
  toStatus: DecisionStatus;
}

export interface UpdateDecisionStatusRequest {
  status: DecisionStatus;
  expectedStatus: DecisionStatus;
  note?: string;
}

export interface ReopenDecisionRequest {
  note?: string;
}

export interface AssignDecisionOwnerRequest {
  assignedToUserId: string;
}

export interface AssignDecisionOwnerResponse {
  id: string;
  assignedToUserId: string;
}

export interface AssignDecisionTeamRequest {
  teamId: string;
  reason?: string;
}

export interface DecisionTeamAssignment {
  id: string;
  organizationId: string;
  decisionId: string;
  teamId: string;
  assignedByUserId: string;
  assignmentSource: string;
  assignmentReason: string;
  previousTeamId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyzeDecisionsResponse {
  message: string;
  organizationId: string;
  enqueuedCount: number;
}

export type RemediationActionType =
  | "REMEDIATION"
  | "PATCH_APPLIED"
  | "CONFIG_CHANGE"
  | "WORKAROUND"
  | "DOCUMENTATION";

export type EvidenceType =
  | "DOCUMENT"
  | "LOG_EXTRACT"
  | "CONFIG_SNAPSHOT"
  | "SCREENSHOT"
  | "CODE_DIFF"
  | "SCAN_RESULT"
  | "CUSTOM";

export interface EvidenceInput {
  evidenceType: EvidenceType;
  title: string;
  description?: string;
  rawPayload?: Record<string, unknown>;
}

export interface EvidenceRecord {
  id: string;
  organizationId: string;
  source: string;
  sourceId: string;
  sourceType: string;
  rawPayload: Record<string, unknown>;
  hash: string;
  capturedAt: string;
  createdAt: string;
}

export interface EvidenceLink {
  id: string;
  organizationId: string;
  actionId?: string;
  verificationId?: string;
  evidenceId: string;
  evidenceType: EvidenceType;
  title: string;
  description: string;
  createdAt: string;
  evidence: EvidenceRecord;
}

export interface RemediationEvidenceLink extends EvidenceLink {
  actionId: string;
}

export interface RemediationAction {
  id: string;
  organizationId: string;
  decisionId: string;
  actionType: RemediationActionType;
  title: string;
  description: string;
  submittedByUserId: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  evidenceLinks?: RemediationEvidenceLink[];
}

export interface RemediationListResponse {
  items: RemediationAction[];
  total: number;
  page: number;
  limit: number;
}

export interface SubmitRemediationRequest {
  actionType: RemediationActionType;
  title: string;
  description?: string;
  evidences?: EvidenceInput[];
}

export interface SubmittedEvidence {
  id: string;
  organizationId: string;
  actionId: string;
  evidenceId: string;
  evidenceType: EvidenceType;
  title: string;
  description: string;
  createdAt: string;
}

export interface SubmitRemediationResponse {
  action: RemediationAction;
  evidences: SubmittedEvidence[];
}

export type VerificationType = "TECHNICAL_RECHECK" | "SECURITY_VALIDATION";
export type VerificationResult = "PASS" | "FAIL" | "PARTIAL";

export interface VerificationOutcome {
  id: string;
  organizationId: string;
  decisionId: string;
  verificationId: string;
  outcomeType: string;
  notes: string;
  createdAt: string;
}

export interface VerificationRecord {
  id: string;
  organizationId: string;
  decisionId: string;
  verificationType: VerificationType;
  result: VerificationResult;
  performedByUserId: string;
  notes: string;
  createdAt: string;
  evidenceLinks?: EvidenceLink[];
  outcomes?: VerificationOutcome[];
}

export interface VerificationListResponse {
  items: VerificationRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface SubmitVerificationRequest {
  verificationType: VerificationType;
  result: VerificationResult;
  notes?: string;
  evidences?: EvidenceInput[];
}

export interface SubmitVerificationResponse {
  verification: VerificationRecord;
  evidences: Array<Omit<SubmittedEvidence, "actionId"> & { verificationId: string }>;
  outcome: VerificationOutcome;
}

export type CorrectionType = "ANNOTATION" | "REINTERPRETATION" | "DATA_FIX";

export interface Correction {
  id: string;
  organizationId: string;
  evidenceId: string;
  authorUserId: string;
  correctionType: CorrectionType | string;
  originalPayload: Record<string, unknown>;
  correctedPayload: Record<string, unknown>;
  reason: string;
  auditLogId: string | null;
  createdAt: string;
}

export interface CorrectionListResponse {
  items: Correction[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateCorrectionRequest {
  evidenceId: string;
  correctionType?: CorrectionType;
  correctedPayload: Record<string, unknown>;
  reason: string;
}

export interface CreateCorrectionResponse {
  id: string;
}
