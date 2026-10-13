"use client";

import { Button } from "@/components/ui/button";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { isForbidden } from "@/utils/errorMessages";

interface QueryErrorStateProps {
  error: unknown;
  message?: string;
  onRetry?: () => void;
}

export const QueryErrorState = ({
  error,
  message = "Something went wrong. Please try again later.",
  onRetry,
}: QueryErrorStateProps) => {
  if (isForbidden(error)) {
    return <AccessDenied />;
  }

  return (
    <div className="bg-card border-border flex flex-col items-center gap-3 rounded-xl border p-10 text-center">
      <p className="text-destructive text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};
