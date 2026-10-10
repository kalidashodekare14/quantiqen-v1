"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { useTeams } from "@/hooks/use-teams";
import { useUsers } from "@/hooks/use-users";
import { getFriendlyError } from "@/utils/errorMessages";
import type { DecisionDetail } from "@/types/platform/decision-api.types";
import {
  useApproveDecision,
  useAssignDecisionOwner,
  useAssignDecisionTeam,
  useRejectDecision,
} from "../../hooks/useDecisions";

interface DecisionActionsProps {
  decision: DecisionDetail;
}

type ActionDialog = "approve" | "reject" | null;

const DecisionActions = ({ decision }: DecisionActionsProps) => {
  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const [dialog, setDialog] = useState<ActionDialog>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [teamId, setTeamId] = useState("");

  const approve = useApproveDecision();
  const reject = useRejectDecision();
  const assignOwner = useAssignDecisionOwner();
  const assignTeam = useAssignDecisionTeam();

  const { data: users, isError: usersError } = useUsers();
  const { data: teams, isError: teamsError } = useTeams();

  const canTransition = ["PENDING", "UNDER_REVIEW"].includes(decision.status);

  const resolveUserName = (id: string) => {
    const user = users?.find((u) => u.id === id);
    return user ? (user.name ?? user.email ?? user.qipUserId) : id;
  };

  const resolveTeamName = (id: string) => {
    const team = teams?.find((t) => t.id === id);
    return team?.name ?? id;
  };

  const closeDialog = () => {
    setDialog(null);
    setNote("");
    setReason("");
  };

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const handleApprove = () => {
    approve.mutate(
      { id: decision.id, body: note.trim() ? { note: note.trim() } : {} },
      {
        onSuccess: () => {
          toast.success("Decision approved.");
          closeDialog();
        },
        onError: handleError,
      },
    );
  };

  const handleReject = () => {
    reject.mutate(
      { id: decision.id, body: reason.trim() ? { reason: reason.trim() } : {} },
      {
        onSuccess: () => {
          toast.success("Decision rejected.");
          closeDialog();
        },
        onError: handleError,
      },
    );
  };

  const handleAssignOwner = () => {
    if (!ownerId) return;
    assignOwner.mutate(
      { id: decision.id, assignedToUserId: ownerId },
      {
        onSuccess: () => {
          setOwnerId("");
          toast.success("Owner assigned.");
        },
        onError: handleError,
      },
    );
  };

  const handleAssignTeam = () => {
    if (!teamId) return;
    assignTeam.mutate(
      { id: decision.id, teamId },
      {
        onSuccess: () => {
          setTeamId("");
          toast.success("Decision reassigned to team.");
        },
        onError: handleError,
      },
    );
  };

  if (!isAdmin) {
    return (
      <p className="text-muted-foreground text-xs">
        Only administrators can approve, reject, or assign decisions.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={!canTransition || approve.isPending}
          onClick={() => setDialog("approve")}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!canTransition || reject.isPending}
          onClick={() => setDialog("reject")}
        >
          Reject
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm">Assign owner</Label>
        <div className="flex gap-2">
          <Select value={ownerId} onValueChange={setOwnerId}>
            <SelectTrigger className="h-9 flex-1" aria-label="Select owner">
              <SelectValue
                placeholder={
                  decision.assignedToUserId
                    ? `Current: ${resolveUserName(decision.assignedToUserId)}`
                    : "Select a user"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name ?? user.email ?? user.qipUserId}
                </SelectItem>
              ))}
              {users?.length === 0 && (
                <SelectItem value="none" disabled>
                  No users found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            disabled={!ownerId || assignOwner.isPending}
            onClick={handleAssignOwner}
          >
            {assignOwner.isPending ? "Assigning…" : "Assign"}
          </Button>
        </div>
        {usersError && (
          <p className="text-destructive text-xs">Unable to load users.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm">Assign team</Label>
        <div className="flex gap-2">
          <Select value={teamId} onValueChange={setTeamId}>
            <SelectTrigger className="h-9 flex-1" aria-label="Select team">
              <SelectValue
                placeholder={
                  decision.primaryTeamId
                    ? `Current: ${resolveTeamName(decision.primaryTeamId)}`
                    : "Select a team"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {teams?.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
              {teams?.length === 0 && (
                <SelectItem value="none" disabled>
                  No teams found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            disabled={!teamId || assignTeam.isPending}
            onClick={handleAssignTeam}
          >
            {assignTeam.isPending ? "Assigning…" : "Assign"}
          </Button>
        </div>
        {teamsError && (
          <p className="text-destructive text-xs">Unable to load teams.</p>
        )}
        {teams && teams.length === 0 && !teamsError && (
          <p className="text-muted-foreground text-xs">
            No teams available — create teams under Organization → Teams.
          </p>
        )}
      </div>

      <Dialog open={dialog === "approve"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve decision</DialogTitle>
            <DialogDescription>
              Approving moves this decision to APPROVED. An optional note is recorded in history.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Approval note (optional, max 2000 characters)"
            maxLength={2000}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={approve.isPending}>
              {approve.isPending ? "Approving…" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "reject"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject decision</DialogTitle>
            <DialogDescription>
              Rejecting moves this decision to REJECTED. A reason is strongly recommended.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason (max 2000 characters)"
            maxLength={2000}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={reject.isPending}>
              {reject.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DecisionActions;
