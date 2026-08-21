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
