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
import { getFriendlyError } from "@/utils/errorMessages";
import { useAssets } from "@/features/assets/hooks/useAssets";
import { useTriggerScan } from "../hooks/useScans";

const TriggerScanDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const { data: assets } = useAssets();
  const triggerScan = useTriggerScan();

  const toggleAsset = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const handleTrigger = () => {
    triggerScan.mutate(
      { assetIds: selected },
      {
        onSuccess: (response) => {
          toast.success(`${response.message} — ${response.jobs.length} job(s) queued.`);
          setSelected([]);
          onClose();
        },
        onError: (error) => toast.error(getFriendlyError(error).message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Trigger Scan</DialogTitle>
          <DialogDescription>
            Select assets to scan. Each asset must have opted in to scanning (scanEnabled).
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            {(assets ?? []).map((asset) => {
              const isSelected = selected.includes(asset.id);
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => toggleAsset(asset.id)}
                  className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <span className="flex flex-col">
                    <span className="text-card-foreground text-sm font-medium">{asset.name}</span>
                    <span className="text-muted-foreground text-xs">{asset.identifier}</span>
                  </span>
                  <span className="text-muted-foreground text-xs">{asset.assetType}</span>
                </button>
              );
            })}
            {(assets ?? []).length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No assets available.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={triggerScan.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleTrigger}
            disabled={selected.length === 0 || triggerScan.isPending}
          >
            {triggerScan.isPending
              ? "Triggering…"
              : `Trigger Scan (${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TriggerScanDialog;
