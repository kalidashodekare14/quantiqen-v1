import { api } from "@/lib/axios";
import type { AxiosResponse } from "axios";
import type {
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  RefreshResponse,
  StepUpEnrollResponse,
  StepUpConfirmRequest,
  StepUpVerifyRequest,
  StepUpVerifyResponse,
  MfaStatusResponse,
} from "@/types/auth.types";

export const authApi = {
  login(data: LoginRequest, turnstileToken?: string): Promise<AxiosResponse<LoginResponse>> {
    return api
      .post("/api/v1/auth/login", data, {
        headers: turnstileToken ? { "x-turnstile-token": turnstileToken } : undefined,
        validateStatus: () => true,
      });
  },

  changePassword(data: ChangePasswordRequest): Promise<{ ok: true }> {
    return api.post("/api/v1/auth/change-password", data).then((res) => res.data);
  },

  refresh(): Promise<RefreshResponse> {
    return api.post("/api/v1/auth/refresh").then((res) => res.data);
  },

  logout(): Promise<{ ok: true }> {
    return api.post("/api/v1/auth/logout").then((res) => res.data);
  },

  stepUpEnroll(stepUpToken: string): Promise<StepUpEnrollResponse> {
    return api
      .post("/api/v1/auth/mfa/step-up/enroll", { stepUpToken })
      .then((res) => res.data);
  },

  stepUpConfirm(data: StepUpConfirmRequest): Promise<{ enabled: true }> {
    return api
      .post("/api/v1/auth/mfa/step-up/confirm", data)
      .then((res) => res.data);
  },

  stepUpVerify(data: StepUpVerifyRequest): Promise<StepUpVerifyResponse> {
    return api
      .post("/api/v1/auth/step-up/verify", data)
      .then((res) => res.data);
  },

  getMfaStatus(): Promise<MfaStatusResponse> {
    return api.get("/api/v1/auth/mfa/status").then((res) => res.data);
  },
};
