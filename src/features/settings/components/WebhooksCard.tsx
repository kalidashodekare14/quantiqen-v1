"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { fadeInUp } from "@/lib/motion";
import { useRole } from "@/hooks/use-role";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import type { WebhookEndpoint } from "@/types/platform/notification-api.types";
import {
  useDeleteWebhook,
  useTestWebhook,
  useUpdateWebhook,
  useWebhooks,
} from "../hooks/useNotifications";
import WebhookFormDialog from "./WebhookFormDialog";

const WebhooksCard = () => {
  const [formState, setFormState] = useState<
    { mode: "create" } | { mode: "edit"; webhook: WebhookEndpoint } | null
  >(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const { data: webhooks, isLoading } = useWebhooks();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const handleToggleActive = (webhook: WebhookEndpoint, checked: boolean) => {
    updateWebhook.mutate(
      { id: webhook.id, body: { active: checked } },
      {
        onSuccess: () => toast.success(`Webhook ${checked ? "activated" : "deactivated"}.`),
        onError: handleError,
      },
    );
  };

  const handleTest = (webhook: WebhookEndpoint) => {
    testWebhook.mutate(webhook.id, {
      onSuccess: (response) => toast.success(response.message),
      onError: handleError,
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteWebhook.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Webhook deleted.");
        setDeleteId(null);
      },
      onError: handleError,
    });
  };

  return (
    <motion.div {...fadeInUp(0.15)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-card-foreground text-sm font-semibold lg:text-base">
          Webhook Endpoints
        </h3>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={() => setFormState({ mode: "create" })}>
            <Plus className="mr-1.5 size-4" />
            Register
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-4 text-center text-sm">Loading webhooks…</p>
      ) : !webhooks || webhooks.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          No webhooks registered yet.
        </p>
      ) : (
        <div className="flex flex-col">
          {webhooks.map((webhook, idx) => (
            <div
              key={webhook.id}
              className={`flex flex-wrap items-center justify-between gap-3 py-3 ${
                idx < webhooks.length - 1 ? "border-border border-b" : ""
              }`}
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-card-foreground truncate text-sm font-medium">
                  {webhook.url}
                </span>
                <span className="text-muted-foreground text-xs">
                  {webhook.description ?? "No description"} · added{" "}
                  {formatDateTime(webhook.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={webhook.active}
                  disabled={!isAdmin || updateWebhook.isPending}
                  onCheckedChange={(checked) => handleToggleActive(webhook, checked)}
                  aria-label="Toggle webhook active"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!isAdmin || testWebhook.isPending}
                  onClick={() => handleTest(webhook)}
                >
                  <Send className="mr-1.5 size-4" />
                  Test
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFormState({ mode: "edit", webhook })}
                      aria-label="Edit webhook"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(webhook.id)}
                      aria-label="Delete webhook"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {formState && (
        <WebhookFormDialog
          {...(formState.mode === "edit" ? { webhook: formState.webhook } : {})}
          open
          onClose={() => setFormState(null)}
        />
      )}

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              The endpoint will stop receiving deliveries immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteWebhook.isPending}>
              {deleteWebhook.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default WebhooksCard;
