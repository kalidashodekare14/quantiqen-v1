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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import type { VerificationResult, VerificationType } from "@/types/platform/decision-api.types";
import { useDecisionVerifications, useSubmitVerification } from "../../hooks/useDecisions";
import CorrectionDialog from "./CorrectionDialog";
import EvidenceInputList, {
  toEvidenceInputs,
  type EvidenceDraft,
} from "./EvidenceInput";

interface VerificationSectionProps {
  decisionId: string;
}

const VERIFICATION_TYPES: VerificationType[] = ["TECHNICAL_RECHECK", "SECURITY_VALIDATION"];
const RESULTS: VerificationResult[] = ["PASS", "FAIL", "PARTIAL"];

const resultBadgeClass: Record<VerificationResult, string> = {
  PASS: "bg-chart-2/10 text-chart-2",
  FAIL: "bg-destructive/10 text-destructive",
  PARTIAL: "bg-chart-3/10 text-chart-3",
};

const VerificationSection = ({ decisionId }: VerificationSectionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verificationType, setVerificationType] = useState<VerificationType>("TECHNICAL_RECHECK");
  const [result, setResult] = useState<VerificationResult>("PASS");
  const [notes, setNotes] = useState("");
  const [evidences, setEvidences] = useState<EvidenceDraft[]>([]);
  const [correctionTarget, setCorrectionTarget] = useState<{
    evidenceId: string;
    evidenceTitle: string;
  } | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);
  const canCorrect = hasAnyRole(["CUSTOMER_ADMIN", "ANALYST"]);

  const { data, isLoading } = useDecisionVerifications(decisionId);
  const submitVerification = useSubmitVerification();

  const closeDialog = () => {
    setDialogOpen(false);
    setNotes("");
    setEvidences([]);
  };

  const handleSubmit = () => {
    const evidenceInputs = toEvidenceInputs(evidences);

    submitVerification.mutate(
      {
        id: decisionId,
        body: {
          verificationType,
          result,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          ...(evidenceInputs.length > 0 ? { evidences: evidenceInputs } : {}),
        },
      },
      {
        onSuccess: (response) => {
          const outcome = response.outcome.outcomeType;
          if (outcome === "VERIFIED") {
            toast.success("Verification passed — decision verified.");
          } else {
            toast.info("Verification failed — decision reopened for re-analysis.");
          }
          closeDialog();
        },
        onError: (error) => toast.error(getFriendlyError(error).message),
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {data ? `${data.total} verification${data.total === 1 ? "" : "s"}` : "Verification"}
        </p>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            Submit verification
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading verifications…</p>
      ) : !data || data.items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No verifications yet. Remediation must be submitted before verification.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.items.map((verification) => {
            const outcome = verification.outcomes?.[0]?.outcomeType;

            return (
              <div key={verification.id} className="bg-muted/50 rounded-lg p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {verification.verificationType.replaceAll("_", " ")}
                  </Badge>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${resultBadgeClass[verification.result]}`}
                  >
                    {verification.result}
                  </span>
                  {outcome && (
                    <Badge variant="outline">{outcome.replaceAll("_", " ")}</Badge>
                  )}
                  <span className="text-muted-foreground ml-auto text-xs">
                    {formatDateTime(verification.createdAt)}
                  </span>
                </div>
                {verification.notes && (
                  <p className="text-muted-foreground mt-1 text-sm">{verification.notes}</p>
                )}

                {verification.evidenceLinks && verification.evidenceLinks.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {verification.evidenceLinks.map((link) => (
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
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit verification</DialogTitle>
            <DialogDescription>
              PASS verifies the decision; FAIL or PARTIAL reopens it with a recheck finding.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="verification-type">
                  Verification type
                </label>
                <Select
                  value={verificationType}
                  onValueChange={(value) => setVerificationType(value as VerificationType)}
                >
                  <SelectTrigger id="verification-type" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VERIFICATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="verification-result">
                  Result
                </label>
                <Select
                  value={result}
                  onValueChange={(value) => setResult(value as VerificationResult)}
                >
                  <SelectTrigger id="verification-result" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESULTS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="verification-notes">
                Notes
              </label>
              <Textarea
                id="verification-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={10000}
                rows={3}
                placeholder="What was checked and what was the outcome?"
              />
            </div>

            <EvidenceInputList evidences={evidences} onChange={setEvidences} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitVerification.isPending}>
              {submitVerification.isPending ? "Submitting…" : "Submit"}
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

export default VerificationSection;
