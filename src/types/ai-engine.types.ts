interface FindingInput {
  finding_id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  affected_asset: string;
  asset_type: string;
}

interface AIDecisionRequest {
  organization: string;
  findings: FindingInput[];
}

interface AIDecisionItem {
  finding_id: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  risk_score: number;
  recommendation: string;
  timeline: string;
  justification?: string;
  business_impact?: string;
  confidence_score?: number;
  // new
  decision_id?: string;
  organization_id?: string;
  generated_at?: string;
}

interface AIDecisionResponse {
  request_id: string;
  organization: string;
  overall_risk_score: number;
  summary: string;
  decisions: AIDecisionItem[];
  processing_time?: number;
  // new
  model_used?: string;
  engine_version?: string;
  schema_version?: string;
  generated_at?: string;
  cache_hit?: boolean;
}

interface AIEngineError {
  error_code: string;
  message: string;
  request_id?: string;
  component?: string;
}

interface AIHealthResponse {
  status: string;
}

interface AIReadyResponse {
  status: string;
  dependencies?: Record<string, string>;
}

export type {
  FindingInput,
  AIDecisionRequest,
  AIDecisionItem,
  AIDecisionResponse,
  AIEngineError,
  AIHealthResponse,
  AIReadyResponse,
};
