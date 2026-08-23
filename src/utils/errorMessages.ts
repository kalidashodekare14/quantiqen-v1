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
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message;
  }
  return undefined;
}

export function getFriendlyError(err: unknown): ErrorResult {
  const status = getStatusFromError(err);

  if (status === 401 || status === 403) {
    return {
      message: "Your session has expired. Redirecting to login...",
      shouldRedirectToLogin: true,
    };
  }

  if (status === 400) {
    return {
      message: getServerMessage(err) ?? "Invalid request. Please check your input.",
      shouldRedirectToLogin: false,
    };
  }

  if (status === 404) {
    return {
      message: "The requested resource was not found.",
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
