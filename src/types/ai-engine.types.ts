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
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  risk_score: number;
  recommendation: string;
  timeline: string;
  justification?: string;
  business_impact?: string;
  technical_impact?: string;
  risk_factors?: string[];
  confidence_score?: number;
}

interface AIDecisionResponse {
  request_id: string;
  organization: string;
  overall_risk_score: number;
  summary: string;
  decisions: AIDecisionItem[];
  generated_at: string;
  model_used?: string;
  cache_hit?: boolean;
}

interface AIEngineError {
  error_code: string;
  message: string;
  request_id?: string;
  failed_component?: string;
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
