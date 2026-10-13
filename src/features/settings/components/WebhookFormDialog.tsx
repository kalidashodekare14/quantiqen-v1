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
import { getFriendlyError } from "@/utils/errorMessages";
import type { WebhookEndpoint } from "@/types/platform/notification-api.types";
import { useCreateWebhook, useUpdateWebhook } from "../hooks/useNotifications";

interface WebhookFormDialogProps {
  webhook?: WebhookEndpoint;
  open: boolean;
  onClose: () => void;
}

const WebhookFormDialog = ({ webhook, open, onClose }: WebhookFormDialogProps) => {
  const isEdit = Boolean(webhook);

  const [url, setUrl] = useState(webhook?.url ?? "");
  const [secret, setSecret] = useState("");
  const [description, setDescription] = useState(webhook?.description ?? "");
  const [active, setActive] = useState(webhook?.active ?? true);

  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const isPending = createWebhook.isPending || updateWebhook.isPending;

  const handleSubmit = () => {
    if (!url.trim()) {
      toast.error("Webhook URL is required.");
      return;
    }
    if (!isEdit && !secret.trim()) {
      toast.error("Secret is required to register a webhook.");
      return;
    }

    const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

    if (isEdit && webhook) {
      updateWebhook.mutate(
        {
          id: webhook.id,
          body: {
            url: url.trim(),
            description: description.trim() || undefined,
            active,
            ...(secret.trim() ? { secret: secret.trim() } : {}),
          },
        },
        {
          onSuccess: () => {
            toast.success("Webhook updated.");
            onClose();
          },
          onError: handleError,
        },
      );
      return;
    }

    createWebhook.mutate(
      {
        url: url.trim(),
        secret: secret.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Webhook registered.");
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
          <DialogTitle>{isEdit ? "Edit Webhook" : "Register Webhook"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the endpoint URL, secret, and active state."
              : "Register an HTTPS endpoint that receives notification deliveries."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhook-url">URL</Label>
            <Input
              id="webhook-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/hooks/quantiqen"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhook-secret">Secret {isEdit && "(leave blank to keep)"}</Label>
            <Input
              id="webhook-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={isEdit ? "••••••••" : "signing secret"}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhook-description">Description</Label>
            <Input
              id="webhook-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this endpoint is for"
            />
          </div>

          {isEdit && (
            <div className="flex items-center justify-between">
              <Label htmlFor="webhook-active">Active</Label>
              <Switch id="webhook-active" checked={active} onCheckedChange={setActive} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookFormDialog;
