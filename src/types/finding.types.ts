export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'vulnerability' | 'misconfiguration' | 'exposure' | 'anomaly';
  affected_asset: string;
  asset_type: string;
  organization: string;
  status: 'pending' | 'analyzed';
  owner: string;
}

export interface FindingsData {
  findings: Finding[];
}
