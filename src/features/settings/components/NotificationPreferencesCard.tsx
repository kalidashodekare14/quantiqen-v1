"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fadeInUp } from "@/lib/motion";
import { useRole } from "@/hooks/use-role";
import { getFriendlyError } from "@/utils/errorMessages";
import type {
  NotificationChannel,
  NotificationPreference,
  NotificationType,
} from "@/types/platform/notification-api.types";
import { NOTIFICATION_CHANNELS, NOTIFICATION_TYPES } from "@/types/platform/notification-api.types";
import {
  useDeleteNotificationPreference,
  useNotificationPreferences,
  useUpsertNotificationPreference,
  useWebhooks,
} from "../hooks/useNotifications";

const typeLabel = (type: NotificationType) => type.replaceAll("_", " ").toLowerCase();

interface PrefDialogState {
  type: NotificationType;
  preference?: NotificationPreference;
}

const PreferenceDialog = ({ state, onClose }: { state: PrefDialogState; onClose: () => void }) => {
  const existing = state.preference;

  const [enabled, setEnabled] = useState(existing?.enabled ?? true);
  const [channels, setChannels] = useState<NotificationChannel[]>(
    existing?.channels ?? ["EMAIL"],
  );
  const [emails, setEmails] = useState((existing?.emailAddresses ?? []).join(", "));
  const [slackUrl, setSlackUrl] = useState(existing?.slackWebhookUrl ?? "");
  const [webhookEndpointId, setWebhookEndpointId] = useState(
    existing?.customWebhookEndpointId ?? "",
  );
  const [endpointError, setEndpointError] = useState<string | null>(null);

  const upsert = useUpsertNotificationPreference();
  const remove = useDeleteNotificationPreference();
  const { data: webhooks, isLoading: webhooksLoading } = useWebhooks();

  const webhookSelected = channels.includes("WEBHOOK");
  const endpointOptions = (webhooks ?? []).filter((endpoint) => endpoint.active && !endpoint.deletedAt);
  const selectedEndpointMissing =
    Boolean(webhookEndpointId) &&
    !webhooksLoading &&
    !endpointOptions.some((endpoint) => endpoint.id === webhookEndpointId);

  const endpointLabel = (endpoint: { url: string; description: string | null }) => {
    if (endpoint.description) return endpoint.description;
    try {
      const parsed = new URL(endpoint.url);
      const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
      const shortenedPath =
        path.length > 20 ? `${path.slice(0, 20)}…` : path;
      return `${parsed.host}${shortenedPath}`;
    } catch {
      return endpoint.url.length > 40 ? `${endpoint.url.slice(0, 40)}…` : endpoint.url;
    }
  };

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((value) => value !== channel)
        : [...current, channel],
    );
  };

  const handleSave = () => {
    if (webhookSelected) {
      if (webhooksLoading) {
        setEndpointError("Webhook endpoints are still loading — try again in a moment.");
        return;
      }
      if (!webhookEndpointId) {
        setEndpointError("Select a webhook endpoint for the WEBHOOK channel.");
        return;
      }
      if (selectedEndpointMissing) {
        setEndpointError("The saved webhook endpoint no longer exists — select a valid one.");
        return;
      }
      setEndpointError(null);
    }

    const emailAddresses = emails
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    upsert.mutate(
      {
        notificationType: state.type,
        channels,
        enabled,
        emailAddresses,
        ...(slackUrl.trim() ? { slackWebhookUrl: slackUrl.trim() } : {}),
        ...(webhookSelected && webhookEndpointId
          ? { customWebhookEndpointId: webhookEndpointId }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success("Preference saved.");
          onClose();
        },
        onError: handleError,
      },
    );
  };

  const handleDelete = () => {
    if (!existing) return;
    remove.mutate(existing.id, {
      onSuccess: () => {
        toast.success("Preference removed — defaults apply.");
        onClose();
      },
      onError: handleError,
    });
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{typeLabel(state.type)}</DialogTitle>
          <DialogDescription>
            Choose channels and contact details for this notification type.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pref-enabled">Enabled</Label>
            <Switch id="pref-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Channels</Label>
            <div className="flex flex-wrap gap-2">
              {NOTIFICATION_CHANNELS.map((channel) => {
                const selected = channels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-card-foreground"
                    }`}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pref-emails">Email addresses (comma separated)</Label>
            <Input
              id="pref-emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="secops@example.com, oncall@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pref-slack">Slack webhook URL</Label>
            <Input
              id="pref-slack"
              value={slackUrl}
              onChange={(e) => setSlackUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/…"
            />
          </div>

          {webhookSelected && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pref-webhook-endpoint">Webhook endpoint</Label>
              <Select
                value={webhookEndpointId || undefined}
                onValueChange={(value) => {
                  setWebhookEndpointId(value);
                  setEndpointError(null);
                }}
                disabled={webhooksLoading || endpointOptions.length === 0}
              >
                <SelectTrigger className="w-full" id="pref-webhook-endpoint">
                  <SelectValue
                    placeholder={
                      webhooksLoading
                        ? "Loading endpoints…"
                        : endpointOptions.length === 0
                          ? "No webhook endpoints registered"
                          : "Select a webhook endpoint"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-w-70">
                  {endpointOptions.map((endpoint) => (
                    <SelectItem key={endpoint.id} value={endpoint.id}>
                      <span className="block max-w-60 truncate">
                        {endpointLabel(endpoint)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {endpointError ? (
                <p className="text-destructive text-xs">{endpointError}</p>
              ) : selectedEndpointMissing ? (
                <p className="text-destructive text-xs">
                  The saved webhook endpoint no longer exists — select a valid one.
                </p>
              ) : !webhooksLoading && endpointOptions.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No webhook endpoints registered — add one under Settings → Webhooks first.
                </p>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {existing && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={remove.isPending || upsert.isPending}
            >
              {remove.isPending ? "Removing…" : "Remove"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={upsert.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={upsert.isPending}>
            {upsert.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NotificationPreferencesCard = () => {
  const [dialog, setDialog] = useState<PrefDialogState | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const { data: preferences, isLoading } = useNotificationPreferences();
  const upsert = useUpsertNotificationPreference();

  const prefForType = (type: NotificationType) =>
    preferences?.find((preference) => preference.notificationType === type);

  const handleToggleEnabled = (preference: NotificationPreference, checked: boolean) => {
    upsert.mutate(
      {
        notificationType: preference.notificationType,
        channels: preference.channels,
        enabled: checked,
        emailAddresses: preference.emailAddresses,
        ...(preference.slackWebhookUrl
          ? { slackWebhookUrl: preference.slackWebhookUrl }
          : {}),
        ...(preference.customWebhookEndpointId
          ? { customWebhookEndpointId: preference.customWebhookEndpointId }
          : {}),
      },
      {
        onSuccess: () => toast.success("Preference saved."),
        onError: (error) => toast.error(getFriendlyError(error).message),
      },
    );
  };

  return (
    <motion.div {...fadeInUp(0.1)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-card-foreground text-sm font-semibold lg:text-base">
          Notification Preferences
        </h3>
        {!isAdmin && (
          <span className="text-muted-foreground text-xs">
            Editing requires CUSTOMER_ADMIN role
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-4 text-center text-sm">Loading preferences…</p>
      ) : (
        <div className="flex flex-col">
          {NOTIFICATION_TYPES.map((type, idx) => {
            const preference = prefForType(type);
            return (
              <div
                key={type}
                className={`flex flex-wrap items-center justify-between gap-2 py-3 ${
                  idx < NOTIFICATION_TYPES.length - 1 ? "border-border border-b" : ""
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-card-foreground text-sm lg:text-base">
                    {typeLabel(type)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {preference
                      ? `${preference.enabled ? "Enabled" : "Disabled"} · ${preference.channels.join(", ") || "no channels"}`
                      : "Not configured (platform defaults)"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {preference && (
                    <Switch
                      checked={preference.enabled}
                      disabled={!isAdmin || upsert.isPending}
                      onCheckedChange={(checked) => handleToggleEnabled(preference, checked)}
                      aria-label={`Toggle ${typeLabel(type)}`}
                    />
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!isAdmin}
                    onClick={() => setDialog({ type, ...(preference ? { preference } : {}) })}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dialog && <PreferenceDialog state={dialog} onClose={() => setDialog(null)} />}
    </motion.div>
  );
};

export default NotificationPreferencesCard;
