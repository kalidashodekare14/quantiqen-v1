"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/hooks/use-role";
import { useUsers } from "@/hooks/use-users";
import {
  useAddTeamMember,
  useDeactivateTeam,
  useTeamDetail,
  useRemoveTeamMember,
} from "@/hooks/use-teams";
import { getFriendlyError } from "@/utils/errorMessages";
import { formatDateTime } from "@/utils/date/date";

interface TeamDetailDialogProps {
  teamId: string;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const TeamDetailDialog = ({ teamId, open, onClose, onEdit }: TeamDetailDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLead, setIsLead] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const { data: team, isLoading } = useTeamDetail(open ? teamId : undefined);
  const { data: users } = useUsers();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();
  const deactivate = useDeactivateTeam();

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const userDisplay = (userId: string) =>
    users?.find((user) => user.id === userId)?.name ??
    users?.find((user) => user.id === userId)?.email ??
    userId;

  const memberIds = new Set(team?.members.map((member) => member.userId) ?? []);
  const availableUsers = (users ?? []).filter((user) => !memberIds.has(user.id));

  const handleAddMember = () => {
    if (!selectedUserId) return;
    addMember.mutate(
      { teamId, body: { userId: selectedUserId, isLead } },
      {
        onSuccess: () => {
          toast.success("Member added.");
          setSelectedUserId("");
          setIsLead(false);
        },
        onError: handleError,
      },
    );
  };

  const handleRemoveMember = (userId: string) => {
    removeMember.mutate(
      { teamId, userId },
      {
        onSuccess: () => toast.success("Member removed."),
        onError: handleError,
      },
    );
  };

  const handleDeactivate = () => {
    deactivate.mutate(teamId, {
      onSuccess: () => {
        toast.success("Team deactivated.");
        setConfirmDeactivate(false);
        onClose();
      },
      onError: handleError,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {team?.name ?? "Team"}
              {team && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                    team.isActive
                      ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {team.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>{team?.description ?? ""}</DialogDescription>
          </DialogHeader>

          {isLoading || !team ? (
            <div className="flex flex-col gap-3 py-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Members ({team.members.length})
                </p>
                <span className="text-muted-foreground text-xs">
                  Created {formatDateTime(team.createdAt)}
                </span>
              </div>

              {team.members.length === 0 ? (
                <p className="text-muted-foreground text-sm">No members yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex flex-col">
                        <span className="text-card-foreground text-sm font-medium">
                          {userDisplay(member.userId)}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs">
                          {member.userId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.isLead && (
                          <Badge className="bg-chart-5/10 text-chart-5 border-chart-5/20 border">
                            Lead
                          </Badge>
                        )}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={removeMember.isPending}
                            onClick={() => handleRemoveMember(member.userId)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div className="bg-muted/40 border-border flex flex-col gap-3 rounded-lg border p-3">
                  <p className="text-card-foreground text-sm font-medium">Add member</p>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex min-w-48 flex-1 flex-col gap-1.5">
                      <Label className="text-xs">User</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger className="h-9" aria-label="Select user">
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name ?? user.email ?? user.qipUserId}
                            </SelectItem>
                          ))}
                          {availableUsers.length === 0 && (
                            <SelectItem value="none" disabled>
                              All users added
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                      <Label className="text-xs" htmlFor="member-lead">
                        Lead
                      </Label>
                      <Switch id="member-lead" checked={isLead} onCheckedChange={setIsLead} />
                    </div>
                    <Button
                      size="sm"
                      className="h-9"
                      disabled={!selectedUserId || addMember.isPending}
                      onClick={handleAddMember}
                    >
                      {addMember.isPending ? "Adding…" : "Add"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isAdmin && team && (
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={onEdit}>
                Edit Team
              </Button>
              {team.isActive && (
                <Button variant="destructive" onClick={() => setConfirmDeactivate(true)}>
                  Deactivate
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate team?</AlertDialogTitle>
            <AlertDialogDescription>
              This deactivates the team. Existing assignments are kept, but the team can no longer
              be used for new assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} disabled={deactivate.isPending}>
              {deactivate.isPending ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeamDetailDialog;
