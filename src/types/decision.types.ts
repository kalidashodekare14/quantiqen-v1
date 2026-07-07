export interface DecisionDetails {
  description: string;
  affectedAssets: string[];
  responsibleTeam: string;
  cvss: number;
  tags: string[];
}

export interface Decision {
  id: string;
  organization: string;
  asset: string;
  risk: string;
  businessImpact: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  owner: string;
  status: "Pending" | "In Review" | "Resolved";
  priority: "Low" | "Medium" | "High" | "Critical";
  time: string;
  details: DecisionDetails;
}

export interface DecisionMeta {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
}

export interface DecisionsData {
  decisions: Decision[];
  meta: DecisionMeta;
}
