import axios from "axios";

import { ApiError, ApiErrorEnvelope } from "@/types/api.types";

function isApiErrorEnvelope(data: unknown): data is ApiErrorEnvelope {
  if (!data || typeof data !== "object") return false;
  const envelope = data as Partial<ApiErrorEnvelope>;
  if (!envelope.error || typeof envelope.error !== "object") return false;
  return typeof envelope.error.message === "string";
}

export function extractApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const data = err.response?.data;

    if (isApiErrorEnvelope(data)) {
      return {
        status,
        code: data.error.code,
        message: data.error.message,
        requestId: data.error.request_id,
      };
    }

    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      return {
        status,
        code: "UNKNOWN",
        message: typeof message === "string" ? message : err.message,
      };
    }

    return { status, code: "NETWORK_ERROR", message: err.message };
  }

  if (err instanceof Error) {
    return { status: 0, code: "UNKNOWN", message: err.message };
  }

  return { status: 0, code: "UNKNOWN", message: "An unexpected error occurred." };
}

export function getApiErrorMessage(err: unknown): string {
  return extractApiError(err).message;
}
