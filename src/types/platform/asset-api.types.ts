export type AssetType = "DOMAIN" | "IP" | "URL" | "CIDR" | "CLOUD_RESOURCE" | "SERVICE" | "OTHER";

export type AssetStatus = "ACTIVE" | "INACTIVE" | "UNKNOWN";

export type AssetCriticality = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNRATED";

export type AssetEnvironment = "PRODUCTION" | "STAGING" | "DEVELOPMENT" | "UNKNOWN";

export type InternetExposure = "INTERNET_FACING" | "INTERNAL_ONLY" | "UNKNOWN";

export type CustomerImpact = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type RegulatoryImpact = "HIGH" | "MEDIUM" | "LOW" | "NONE";

export interface PlatformAsset {
  id: string;
  organizationId: string;
  name: string;
  assetType: AssetType;
  identifier: string;
  environment: AssetEnvironment;
  criticality: AssetCriticality;
  dataSensitivity: number;
  ownerUserId: string | null;
  status: AssetStatus;
  discovered: boolean;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AssetListParams {
  assetType?: AssetType;
  status?: AssetStatus;
  criticality?: AssetCriticality;
  environment?: AssetEnvironment;
}

export interface CreateAssetRequest {
  name: string;
  assetType: AssetType;
  identifier: string;
  environment: AssetEnvironment;
  criticality: AssetCriticality;
  dataSensitivity: number;
  internetExposure?: InternetExposure;
  customerImpact?: CustomerImpact;
  regulatoryImpact?: RegulatoryImpact;
  ownerUserId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateAssetRequest extends Partial<CreateAssetRequest> {
  status?: AssetStatus;
}

export interface AssetRelationship {
  id: string;
  organizationId: string;
  parentAssetId: string;
  childAssetId: string;
  relationshipType: string;
  createdAt: string;
}

export interface CreateAssetRelationshipRequest {
  childAssetId: string;
  relationshipType: string;
}
