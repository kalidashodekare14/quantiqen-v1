export interface PortalPolicy {
  mfaPolicy: {
    denyThreshold: number;
    stepUpThreshold: number;
    requireMfaOnLogin: boolean;
  };
  ipWhitelist: string[];
}

export interface UpdatePolicyData {
  mfaPolicy?: {
    denyThreshold?: number;
    stepUpThreshold?: number;
    requireMfaOnLogin?: boolean;
  };
  ipWhitelist?: string[];
}
