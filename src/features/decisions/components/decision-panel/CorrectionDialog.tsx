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
import {
  useCreateCorrection,
  useDecisionCorrections,
} from "../../hooks/useDecisions";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import type { CorrectionType } from "@/types/platform/decision-api.types";

const CORRECTION_TYPES: CorrectionType[] = ["ANNOTATION", "REINTERPRETATION", "DATA_FIX"];

interface CorrectionDialogProps {
  evidenceId: string;
  evidenceTitle: string;
  open: boolean;
  onClose: () => void;
}

const CorrectionDialog = ({ evidenceId, evidenceTitle, open, onClose }: CorrectionDialogProps) => {
  const [correctionType, setCorrectionType] = useState<CorrectionType>("ANNOTATION");
  const [payload, setPayload] = useState("");
  const [reason, setReason] = useState("");

  const { data: corrections, isLoading } = useDecisionCorrections(open ? evidenceId : undefined);
  const createCorrection = useCreateCorrection();

  const resetAndClose = () => {
    setCorrectionType("ANNOTATION");
    setPayload("");
    setReason("");
    onClose();
  };

  const handleSubmit = () => {
    let parsedPayload: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(payload || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        toast.error("Corrected payload must be a JSON object.");
        return;
      }
      parsedPayload = parsed as Record<string, unknown>;
    } catch {
      toast.error("Corrected payload must be valid JSON.");
      return;
    }

    if (!reason.trim()) {
      toast.error("A reason is required.");
      return;
    }

    createCorrection.mutate(
      {
        evidenceId,
        correctionType,
        correctedPayload: parsedPayload,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Correction recorded.");
          resetAndClose();
        },
        onError: (error) => toast.error(getFriendlyError(error).message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && resetAndClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Correct evidence</DialogTitle>
          <DialogDescription>
            {evidenceTitle} — the original payload is snapshotted; corrections are append-only.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="correction-type">
              Correction type
            </label>
            <Select
              value={correctionType}
              onValueChange={(value) => setCorrectionType(value as CorrectionType)}
            >
              <SelectTrigger id="correction-type" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CORRECTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="correction-payload">
              Corrected payload (JSON)
            </label>
            <Textarea
              id="correction-payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder='{"verdict": "benign"}'
              rows={4}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="correction-reason">
              Reason <span className="text-destructive">*</span>
            </label>
            <Input
              id="correction-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this correction needed?"
              maxLength={2000}
            />
          </div>

          <div className="border-border border-t pt-3">
            <p className="text-card-foreground mb-2 text-sm font-semibold">
              Existing corrections ({corrections?.total ?? 0})
            </p>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : !corrections || corrections.items.length === 0 ? (
              <p className="text-muted-foreground text-sm">No corrections yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {corrections.items.map((correction) => (
                  <div key={correction.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="secondary">{correction.correctionType}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {formatDateTime(correction.createdAt)}
                      </span>
                    </div>
                    <p className="text-card-foreground">{correction.reason}</p>
                    <pre className="text-muted-foreground mt-1 overflow-auto text-xs">
                      {JSON.stringify(correction.correctedPayload)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createCorrection.isPending}>
            {createCorrection.isPending ? "Saving…" : "Submit correction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CorrectionDialog;
