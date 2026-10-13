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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFriendlyError } from "@/utils/errorMessages";
import { INCIDENT_SEVERITIES, type IncidentSeverity } from "@/types/platform/platform-ops.types";
import { useCreateIncident } from "@/hooks/use-platform-ops";

const IncidentFormDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("HIGH");
  const [components, setComponents] = useState("");
  const [suspensionTriggered, setSuspensionTriggered] = useState(false);

  const createIncident = useCreateIncident();

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    const affectedComponents = components
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (affectedComponents.length === 0) {
      toast.error("List at least one affected component.");
      return;
    }

    createIncident.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        severity,
        affectedComponents,
        suspensionTriggered,
      },
      {
        onSuccess: () => {
          toast.success("Incident created.");
          onClose();
        },
        onError: (error) => toast.error(getFriendlyError(error).message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Declare Incident</DialogTitle>
          <DialogDescription>
            Incidents start as ACTIVE and move through the transition state machine.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="incident-title">Title</Label>
            <Input
              id="incident-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Risk engine degraded"
              maxLength={500}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="incident-description">Description</Label>
            <Textarea
              id="incident-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened and current impact"
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Severity</Label>
            <Select
              value={severity}
              onValueChange={(value) => setSeverity(value as IncidentSeverity)}
            >
              <SelectTrigger className="h-9" aria-label="Incident severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INCIDENT_SEVERITIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="incident-components">Affected components (comma separated)</Label>
            <Input
              id="incident-components"
              value={components}
              onChange={(e) => setComponents(e.target.value)}
              placeholder="risk-engine, notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="incident-suspension">Suspension triggered</Label>
            <Switch
              id="incident-suspension"
              checked={suspensionTriggered}
              onCheckedChange={setSuspensionTriggered}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createIncident.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createIncident.isPending}>
            {createIncident.isPending ? "Creating…" : "Declare Incident"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentFormDialog;
