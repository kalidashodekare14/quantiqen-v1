"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useAssets } from "@/features/assets/hooks/useAssets";
import {
  SCAN_TYPES,
  type ScanPolicyListItem,
  type ScanType,
} from "@/types/platform/scan-api.types";
import { useCreateScanPolicy, useUpdateScanPolicy } from "../hooks/useScans";

interface ScanPolicyDialogProps {
  policy?: ScanPolicyListItem;
  open: boolean;
  onClose: () => void;
}

const ScanPolicyDialog = ({ policy, open, onClose }: ScanPolicyDialogProps) => {
  const isEdit = Boolean(policy);

  const [assetId, setAssetId] = useState("");
  const [scanTypes, setScanTypes] = useState<ScanType[]>(policy?.scanTypes ?? ["DNS", "TLS"]);
  const [intervalMinutes, setIntervalMinutes] = useState(
    String(policy?.intervalMinutes ?? 1440),
  );
  const [enabled, setEnabled] = useState(policy?.enabled ?? true);

  const { data: assets } = useAssets();
  const createPolicy = useCreateScanPolicy();
  const updatePolicy = useUpdateScanPolicy();
  const isPending = createPolicy.isPending || updatePolicy.isPending;

  const toggleScanType = (scanType: ScanType) => {
    setScanTypes((current) =>
      current.includes(scanType)
        ? current.filter((value) => value !== scanType)
        : [...current, scanType],
    );
  };

  const handleSubmit = () => {
    const interval = Number(intervalMinutes);

    if (!isEdit && !assetId) {
      toast.error("Select an asset to scan.");
      return;
    }
    if (scanTypes.length === 0) {
      toast.error("Select at least one scan type.");
      return;
    }
    if (!Number.isFinite(interval) || interval < 60 || interval > 10080) {
      toast.error("Interval must be between 60 and 10080 minutes.");
      return;
    }

    const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

    if (isEdit && policy) {
      updatePolicy.mutate(
        {
          id: policy.id,
          body: { scanTypes, intervalMinutes: interval, enabled },
        },
        {
          onSuccess: () => {
            toast.success("Scan policy updated.");
            onClose();
          },
          onError: handleError,
        },
      );
      return;
    }

    createPolicy.mutate(
      { assetId, scanTypes, intervalMinutes: interval, enabled },
      {
        onSuccess: () => {
          toast.success("Scan policy created.");
          onClose();
        },
        onError: handleError,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Scan Policy" : "Create Scan Policy"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update scan types, interval, and enabled state."
              : "Choose an asset and what to scan. Intervals are 60–10080 minutes."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label>Asset</Label>
              <Select value={assetId} onValueChange={setAssetId}>
                <SelectTrigger className="h-9" aria-label="Select asset">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {(assets ?? []).map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.identifier})
                    </SelectItem>
                  ))}
                  {(assets ?? []).length === 0 && (
                    <SelectItem value="none" disabled>
                      No assets available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Scan Types</Label>
            <div className="flex flex-wrap gap-2">
              {SCAN_TYPES.map((scanType) => {
                const selected = scanTypes.includes(scanType);
                return (
                  <button
                    key={scanType}
                    type="button"
                    onClick={() => toggleScanType(scanType)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-card-foreground"
                    }`}
                  >
                    {scanType.replaceAll("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scan-interval">Interval (minutes)</Label>
            <Input
              id="scan-interval"
              type="number"
              min={60}
              max={10080}
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(e.target.value)}
              className="h-9 w-40"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="scan-enabled">Enabled</Label>
            <Switch id="scan-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScanPolicyDialog;
