"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

  const upsert = useUpsertNotificationPreference();
  const remove = useDeleteNotificationPreference();

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((value) => value !== channel)
        : [...current, channel],
    );
  };

  const handleSave = () => {
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
