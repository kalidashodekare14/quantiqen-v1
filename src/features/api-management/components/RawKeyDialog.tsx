"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RawKeyDialogProps {
  open: boolean;
  onClose: () => void;
  rawKey: string;
  title?: string;
  rotated?: boolean;
}

const RawKeyDialog = ({ open, onClose, rawKey, title, rotated }: RawKeyDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title ?? "API key created"}</DialogTitle>
          <DialogDescription>
            Copy this key now — it is shown only once and cannot be retrieved later.
            {rotated && " The old key remains valid for a 24h grace window."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3">
          <code className="text-card-foreground min-w-0 flex-1 break-all font-mono text-sm leading-relaxed">
            {rawKey}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            aria-label="Copy API key"
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check className="mr-1 size-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1 size-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>

        <p className="text-destructive text-xs">
          Store it in a secure secret manager. Do not commit it to source control.
        </p>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RawKeyDialog;
