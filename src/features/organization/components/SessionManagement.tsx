"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequireRole } from "@/components/auth/RequireRole";
import { usePortalSessions, useRevokeSession } from "../hooks/useSessionManagement";
import { SessionTable } from "./SessionTable";
import { ConfirmRevokeDialog } from "./ConfirmRevokeDialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import AppButton from "@/components/shared/AppButton";
import { toast } from "sonner";
import { ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getFriendlyError } from "@/utils/errorMessages";

type ConfirmTarget =
  | { type: "single"; sessionId: string; isCurrentDevice: boolean }
  | { type: "all" }
  | null;

export function SessionManagement() {
  const router = useRouter();
  const { clearAuth } = useAuth();
  const { data: sessions, isLoading, isError } = usePortalSessions();
  const revokeSession = useRevokeSession();
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);

  const handleRevoke = async (sessionId: string) => {
    const targetSession = sessions?.find((s) => s.id === sessionId);
    try {
      await revokeSession.mutateAsync(sessionId);
      if (targetSession?.currentDevice) {
        clearAuth();
        toast.success("You have been logged out from this device");
        router.push("/login");
        return;
      }
      toast.success("Session revoked");
    } catch (err) {
      const { message } = getFriendlyError(err);
      toast.error(message);
    }
  };

  const handleRevokeAll = async () => {
    const activeSessions = sessions?.filter(
      (s) => s.active && !s.currentDevice,
    );

    if (!activeSessions?.length) {
      toast.info("No other active sessions to revoke");
      return;
    }

    const results = await Promise.allSettled(
      activeSessions.map((s) => revokeSession.mutateAsync(s.id)),
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = results.length - failed;

    if (succeeded > 0) {
      toast.success(`${succeeded} session${succeeded > 1 ? "s" : ""} revoked`);
    }
    if (failed > 0) {
      toast.error(`${failed} session${failed > 1 ? "s" : ""} failed to revoke`);
    }
  };

  const requestRevoke = (sessionId: string) => {
    const targetSession = sessions?.find((s) => s.id === sessionId);
    setConfirmTarget({
      type: "single",
      sessionId,
      isCurrentDevice: targetSession?.currentDevice ?? false,
    });
  };

  const confirmRevoke = async () => {
    if (!confirmTarget) return;

    if (confirmTarget.type === "all") {
      await handleRevokeAll();
    } else {
      await handleRevoke(confirmTarget.sessionId);
    }
    setConfirmTarget(null);
  };

  const confirmDialogTitle =
    confirmTarget?.type === "single"
      ? confirmTarget.isCurrentDevice
        ? "Log out from this device?"
        : "Revoke session?"
      : "Revoke all other sessions?";

  const confirmDialogDescription =
    confirmTarget?.type === "single"
      ? confirmTarget.isCurrentDevice
        ? "This will log you out of this device immediately. Continue?"
        : "Revoke this session? The user/device will be logged out immediately."
      : "This will revoke all other active sessions for this organization. Continue?";

  if (isLoading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Session Management"
          subtitle="View and manage active sessions"
        />
        <RequireRole allowedRoles={["CUSTOMER_ADMIN"]}>
          <AppButton
            variant="danger"
            loading={revokeSession.isPending}
            disabled={revokeSession.isPending}
            icon={<ShieldOff className="size-4" />}
            onClick={() => setConfirmTarget({ type: "all" })}
          >
            Revoke All Other Sessions
          </AppButton>
        </RequireRole>
      </div>

      {isError ? (
        <div className="text-muted-foreground py-8 text-center">
          Failed to load sessions. Please try again.
        </div>
      ) : (
        <SessionTable
          sessions={sessions ?? []}
          onRequestRevoke={requestRevoke}
          revokingSessionId={revokeSession.isPending ? revokeSession.variables : undefined}
        />
      )}

      <ConfirmRevokeDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        onConfirm={confirmRevoke}
        title={confirmDialogTitle}
        description={confirmDialogDescription}
        loading={revokeSession.isPending}
      />
    </div>
  );
}
