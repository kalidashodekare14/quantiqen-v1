interface ErrorResult {
  message: string;
  shouldRedirectToLogin: boolean;
}

function getStatusFromError(err: unknown): number | undefined {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { status?: number } }).response;
    return response?.status;
  }
  return undefined;
}

export function isForbidden(err: unknown): boolean {
  return getStatusFromError(err) === 403;
}

function isNetworkError(err: unknown): boolean {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: string }).message ?? "";
    return (
      message === "Network Error" ||
      message.includes("ECONNREFUSED") ||
      message.includes("timeout")
    );
  }
  return false;
}

function getServerMessage(err: unknown): string | undefined {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;

    if (data && typeof data === "object") {
      const envelope = data as { error?: unknown; message?: unknown };

      if (envelope.error && typeof envelope.error === "object") {
        const nested = envelope.error as { message?: unknown };
        if (typeof nested.message === "string" && nested.message) {
          return nested.message;
        }
      }

      if (typeof envelope.message === "string" && envelope.message) {
        return envelope.message;
      }

      if (typeof envelope.error === "string" && envelope.error) {
        return envelope.error;
      }
    }
  }
  return undefined;
}

export function getFriendlyError(err: unknown): ErrorResult {
  const status = getStatusFromError(err);

  if (status === 401) {
    const serverMsg = getServerMessage(err);
    return {
      message: serverMsg ?? "Your session has expired. Redirecting to login...",
      shouldRedirectToLogin: true,
    };
  }

  if (status === 403) {
    return {
      message: getServerMessage(err) ?? "You don't have permission to perform this action.",
      shouldRedirectToLogin: false,
    };
  }

  if (status === 400) {
    return {
      message: getServerMessage(err) ?? "Invalid request. Please check your input.",
      shouldRedirectToLogin: false,
    };
  }

  if (status === 409) {
    return {
      message:
        getServerMessage(err) ??
        "This record was changed by someone else. Please refresh and try again.",
      shouldRedirectToLogin: false,
    };
  }

  if (status === 404) {
    return {
      message: getServerMessage(err) ?? "The requested resource was not found.",
      shouldRedirectToLogin: false,
    };
  }

  if (status === 429) {
    return {
      message:
        getServerMessage(err) ??
        "Too many requests. Please wait a moment and try again.",
      shouldRedirectToLogin: false,
    };
  }

  if (status === 422) {
    return {
      message: getServerMessage(err) ?? "Validation failed. Please check your input.",
      shouldRedirectToLogin: false,
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      message: "A server error occurred. Please try again later.",
      shouldRedirectToLogin: false,
    };
  }

  if (status !== undefined) {
    return {
      message: getServerMessage(err) ?? "An unexpected error occurred.",
      shouldRedirectToLogin: false,
    };
  }

  if (isNetworkError(err)) {
    return {
      message: "Unable to reach the server. Please check your connection.",
      shouldRedirectToLogin: false,
    };
  }

  if (err instanceof Error) {
    return {
      message: err.message || "An unexpected error occurred.",
      shouldRedirectToLogin: false,
    };
  }

  return {
    message: "An unexpected error occurred.",
    shouldRedirectToLogin: false,
  };
}
