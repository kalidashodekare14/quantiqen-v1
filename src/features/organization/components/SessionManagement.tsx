"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RequireRole } from "@/components/auth/RequireRole";
import { usePortalSessions, useRevokeSession } from "../hooks/useSessionManagement";
import { SessionTable } from "./SessionTable";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export function SessionManagement() {
  const { data: sessions, isLoading, isError } = usePortalSessions();
  const revokeSession = useRevokeSession();

  const handleRevoke = async (sessionId: string) => {
    try {
      await revokeSession.mutateAsync(sessionId);
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
    }
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Session Management"
          subtitle="View and manage active sessions"
        />
        <RequireRole allowedRoles={["CUSTOMER_ADMIN"]}>
          <Button
            variant="destructive"
            onClick={() => {
              const activeSessions = sessions?.filter(
                (s) => s.active && !s.currentDevice,
              );
              if (!activeSessions?.length) {
                toast.info("No other active sessions to revoke");
                return;
              }
              toast.info(
                `Revoking all sessions — use individual revoke for precision`,
              );
            }}
          >
            <ShieldOff className="mr-2 size-4" />
            Revoke All Other Sessions
          </Button>
        </RequireRole>
      </div>

      {isError ? (
        <div className="text-muted-foreground py-8 text-center">
          Failed to load sessions. Please try again.
        </div>
      ) : (
        <SessionTable
          sessions={sessions ?? []}
          onRevoke={handleRevoke}
          isRevoking={revokeSession.isPending}
        />
      )}
    </div>
  );
}
