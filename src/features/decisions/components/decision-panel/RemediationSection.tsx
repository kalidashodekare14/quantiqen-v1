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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { useUsers } from "@/hooks/use-users";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import type {
  ActionStatus,
  DecisionStatus,
  RemediationActionType,
  UpdateRemediationRequest,
} from "@/types/platform/decision-api.types";
import {
  useDecisionRemediations,
  useSubmitRemediation,
  useUpdateRemediationAction,
} from "../../hooks/useDecisions";
import CorrectionDialog from "./CorrectionDialog";
import EvidenceInputList, {
  toEvidenceInputs,
  type EvidenceDraft,
} from "./EvidenceInput";

interface RemediationSectionProps {
  decisionId: string;
  decisionStatus: DecisionStatus;
}

const ACTION_TYPES: RemediationActionType[] = [
  "REMEDIATION",
  "PATCH_APPLIED",
  "CONFIG_CHANGE",
  "WORKAROUND",
  "DOCUMENTATION",
];

const SUBMITTABLE_STATUSES: DecisionStatus[] = ["APPROVED", "IN_PROGRESS", "REOPENED"];

const ACTION_STATUSES: ActionStatus[] = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const RemediationSection = ({ decisionId, decisionStatus }: RemediationSectionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<RemediationActionType>("PATCH_APPLIED");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidences, setEvidences] = useState<EvidenceDraft[]>([]);
  const [correctionTarget, setCorrectionTarget] = useState<{
    evidenceId: string;
    evidenceTitle: string;
  } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);
  const canCorrect = hasAnyRole(["CUSTOMER_ADMIN", "ANALYST"]);
  const canSubmitRemediation = SUBMITTABLE_STATUSES.includes(decisionStatus);

  const { data, isLoading } = useDecisionRemediations(decisionId);
  const { data: users } = useUsers();
  const submitRemediation = useSubmitRemediation();
  const updateAction = useUpdateRemediationAction();

  const closeDialog = () => {
    setDialogOpen(false);
    setTitle("");
    setDescription("");
    setEvidences([]);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("A title is required.");
      return;
    }

    const evidenceInputs = toEvidenceInputs(evidences);

    submitRemediation.mutate(
      {
        id: decisionId,
        body: {
          actionType,
          title: title.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(evidenceInputs.length > 0 ? { evidences: evidenceInputs } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Remediation submitted. Decision moved to REMEDIATION_SUBMITTED.");
          closeDialog();
        },
        onError: (error) => toast.error(getFriendlyError(error).message),
      },
    );
  };

  const handleUpdateFollowUp = (actionId: string, body: UpdateRemediationRequest) => {
    setUpdatingId(actionId);
    updateAction.mutate(
      { id: decisionId, actionId, body },
      {
        onSuccess: () => {
          toast.success("Remediation action updated.");
          setUpdatingId(null);
        },
        onError: (error) => {
          toast.error(getFriendlyError(error).message);
          setUpdatingId(null);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {data ? `${data.total} remediation action${data.total === 1 ? "" : "s"}` : "Remediation"}
        </p>
        {isAdmin &&
          (canSubmitRemediation ? (
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
              Submit remediation
            </Button>
          ) : (
            <span className="text-muted-foreground text-xs">
              Remediation is available for approved, in-progress, or reopened decisions.
            </span>
          ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading remediations…</p>
      ) : !data || data.items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No remediation actions yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.items.map((action) => (
            <div key={action.id} className="bg-muted/50 rounded-lg p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{action.actionType.replaceAll("_", " ")}</Badge>
                <span className="text-card-foreground text-sm font-medium">{action.title}</span>
                <span className="text-muted-foreground ml-auto text-xs">
                  {formatDateTime(action.submittedAt)}
                </span>
              </div>
              {action.description && (
                <p className="text-muted-foreground mt-1 text-sm">{action.description}</p>
              )}

              {isAdmin ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <Select
                    value={action.status ?? "OPEN"}
                    onValueChange={(value) =>
                      handleUpdateFollowUp(action.id, { status: value as ActionStatus })
                    }
                  >
                    <SelectTrigger
                      className="h-8"
                      aria-label="Follow-up status"
                      disabled={updatingId === action.id}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={action.assigneeUserId ?? ""}
                    onValueChange={(value) =>
                      handleUpdateFollowUp(action.id, { assigneeUserId: value })
                    }
                  >
                    <SelectTrigger
                      className="h-8"
                      aria-label="Follow-up assignee"
                      disabled={updatingId === action.id}
                    >
                      <SelectValue placeholder="Assign follow-up…" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name ?? user.email ?? user.qipUserId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    key={action.dueAt ?? "no-due"}
                    type="date"
                    className="h-8"
                    aria-label="Follow-up due date"
                    defaultValue={action.dueAt ? action.dueAt.slice(0, 10) : ""}
                    disabled={updatingId === action.id}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      handleUpdateFollowUp(action.id, {
                        dueAt: new Date(`${e.target.value}T23:59:59.999`).toISOString(),
                      });
                    }}
                  />
                </div>
              ) : (
                <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline">{(action.status ?? "OPEN").replaceAll("_", " ")}</Badge>
                  {action.assigneeUserId && <span>Assignee: {action.assigneeUserId}</span>}
                  {action.dueAt && <span>Due {formatDateTime(action.dueAt)}</span>}
                </div>
              )}

              {action.evidenceLinks && action.evidenceLinks.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {action.evidenceLinks.map((link) => (
                    <div
                      key={link.id}
                      className="bg-card flex items-center justify-between gap-2 rounded-lg px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-card-foreground truncate text-sm">{link.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {link.evidenceType.replaceAll("_", " ")}
                        </p>
                      </div>
                      {canCorrect && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setCorrectionTarget({
                              evidenceId: link.evidenceId,
                              evidenceTitle: link.title,
                            })
                          }
                        >
                          Correct
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit remediation</DialogTitle>
            <DialogDescription>
              The decision moves to REMEDIATION_SUBMITTED and awaits verification.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="remediation-action-type">
                Action type
              </label>
              <Select
                value={actionType}
                onValueChange={(value) => setActionType(value as RemediationActionType)}
              >
                <SelectTrigger id="remediation-action-type" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="remediation-title">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="remediation-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={500}
                placeholder="e.g. Rotated exposed API key"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="remediation-description">
                Description
              </label>
              <Textarea
                id="remediation-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={10000}
                rows={3}
              />
            </div>

            <EvidenceInputList
              evidences={evidences}
              onChange={setEvidences}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitRemediation.isPending}>
              {submitRemediation.isPending ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {correctionTarget && (
        <CorrectionDialog
          evidenceId={correctionTarget.evidenceId}
          evidenceTitle={correctionTarget.evidenceTitle}
          open
          onClose={() => setCorrectionTarget(null)}
        />
      )}
    </div>
  );
};

export default RemediationSection;
