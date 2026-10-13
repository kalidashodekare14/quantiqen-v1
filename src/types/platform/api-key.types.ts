export interface ApiKey {
  id: string;
  name: string;
  environment: "live" | "test" | "dev";
  scopes: string[];
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  rawKey: string;
}

export interface CreateApiKeyRequest {
  name: string;
  environment: "live" | "test" | "dev";
  scopes?: string[];
}

export interface RotateApiKeyResponse {
  newKey: ApiKeyWithSecret;
  oldKey: ApiKey;
}
