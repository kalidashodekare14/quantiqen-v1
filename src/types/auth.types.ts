export interface LoginRequest {
  orgId: string;
  userId: string;
  password: string;
}

export interface LoginSuccess {
  authenticated: true;
  accessToken: string;
  expiresIn: number;
  mustChangePassword: boolean;
}

export interface LoginStepUp {
  error: string;
  stepUpRequired: true;
  stepUpToken: string;
  mfaEnrollmentRequired?: boolean;
}

export type LoginResponse = LoginSuccess | LoginStepUp;

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface StepUpEnrollResponse {
  secret: string;
  otpauthUri: string;
  pendingExpiresIn: number;
}

export interface StepUpConfirmRequest {
  stepUpToken: string;
  code: string;
}

export interface StepUpVerifyRequest {
  stepUpToken: string;
  code: string;
}

export interface StepUpVerifyResponse {
  authenticated: true;
  accessToken: string;
  expiresIn: number;
}

export interface MfaStatusResponse {
  enabled: boolean;
}

export type CustomerRole = "CUSTOMER_ADMIN" | "ANALYST" | "AUDITOR" | "READ_ONLY";

// TODO: Re-verify this shape against the backend's token-signing code if the
// backend JWT structure ever changes. This was confirmed from a single decoded
// sample during backend QA — not generated from a shared backend type.
export interface CustomerJWTPayload {
  org_id: string;
  user_id: string;
  role: CustomerRole;
  session_id: string;
  device_fingerprint_hash: string;
  iat: number;
  exp: number;
}
