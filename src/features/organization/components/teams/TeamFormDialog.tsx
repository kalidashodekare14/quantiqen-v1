"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getFriendlyError } from "@/utils/errorMessages";
import type { Team } from "@/types/platform/team.types";
import { useCreateTeam, useUpdateTeam } from "@/hooks/use-teams";

interface TeamFormDialogProps {
  team?: Team;
  open: boolean;
  onClose: () => void;
}

const TeamFormDialog = ({ team, open, onClose }: TeamFormDialogProps) => {
  const isEdit = Boolean(team);

  const [name, setName] = useState(team?.name ?? "");
  const [description, setDescription] = useState(team?.description ?? "");
  const [isActive, setIsActive] = useState(team?.isActive ?? true);

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const isPending = createTeam.isPending || updateTeam.isPending;

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Team name is required.");
      return;
    }

    const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

    if (isEdit && team) {
      updateTeam.mutate(
        {
          id: team.id,
          body: {
            name: name.trim(),
            description: description.trim(),
            isActive,
          },
        },
        {
          onSuccess: () => {
            toast.success("Team updated.");
            onClose();
          },
          onError: handleError,
        },
      );
      return;
    }

    createTeam.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Team created.");
          onClose();
        },
        onError: handleError,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Team" : "Create Team"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update team details and status." : "Create a team to own decisions together."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-name">Name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Platform Security"
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this team is responsible for"
              rows={3}
              maxLength={2000}
            />
          </div>

          {isEdit && (
            <div className="flex items-center justify-between">
              <Label htmlFor="team-active">Active</Label>
              <Switch id="team-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamFormDialog;
