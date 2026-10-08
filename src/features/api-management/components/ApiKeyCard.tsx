"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";
import AppButton from "@/components/shared/AppButton";
import { getFriendlyError } from "@/utils/errorMessages";
import { formatDateTime, formatRelativeTime } from "@/utils/date/date";
import type { ApiKey, RotateApiKeyResponse } from "@/types/platform/api-key.types";
import { useDeleteApiKey, useRotateApiKey } from "../hooks/useApiManagement";
import { fadeInScale } from "@/lib/motion";

interface ApiKeyCardProps {
  apiKey: ApiKey;
  isAdmin: boolean;
  onRotated: (response: RotateApiKeyResponse) => void;
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-chart-2/10 text-chart-2",
  REVOKED: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-chart-3/10 text-chart-3",
};

const environmentStyles: Record<string, string> = {
  live: "bg-destructive/10 text-destructive",
  test: "bg-chart-5/10 text-chart-5",
  dev: "bg-muted text-muted-foreground",
};

const ApiKeyCard = ({ apiKey, isAdmin, onRotated }: ApiKeyCardProps) => {
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const rotate = useRotateApiKey();
  const revoke = useDeleteApiKey();

  const isActive = apiKey.status === "ACTIVE";

  const handleRotate = () => {
    rotate.mutate(apiKey.id, {
      onSuccess: (response) => onRotated(response),
      onError: (error) => toast.error(getFriendlyError(error).message),
    });
  };

  const handleRevoke = () => {
    revoke.mutate(apiKey.id, {
      onSuccess: () => {
        toast.success("API key revoked.");
        setConfirmRevoke(false);
      },
      onError: (error) => {
        setConfirmRevoke(false);
        toast.error(getFriendlyError(error).message);
      },
    });
  };

  return (
    <motion.div
      {...fadeInScale}
      className="bg-card/80 backdrop-blur-md border border-foreground/10 flex flex-col gap-4 rounded-xl p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-card-foreground truncate text-sm font-semibold lg:text-base">
          {apiKey.name}
        </span>
        <span
          className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${statusStyles[apiKey.status] ?? "bg-muted text-muted-foreground"}`}
        >
          {apiKey.status}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${environmentStyles[apiKey.environment] ?? "bg-muted text-muted-foreground"}`}
        >
          {apiKey.environment}
        </span>
        {apiKey.scopes.map((scope) => (
          <Badge key={scope} variant="secondary" className="font-mono text-xs">
            {scope}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 text-xs lg:text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Created</span>
          <span className="text-card-foreground" title={formatDateTime(apiKey.createdAt)}>
            {formatRelativeTime(apiKey.createdAt)}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Expires</span>
          <span className="text-card-foreground">
            {apiKey.expiresAt ? formatDateTime(apiKey.expiresAt) : "Never"}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Last used</span>
          <span className="text-card-foreground">
            {apiKey.lastUsedAt ? formatRelativeTime(apiKey.lastUsedAt) : "Never"}
          </span>
        </div>
        {apiKey.revokedAt && (
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Revoked</span>
            <span className="text-destructive" title={formatDateTime(apiKey.revokedAt)}>
              {formatRelativeTime(apiKey.revokedAt)}
            </span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-2">
          <AppButton
            variant="outline"
            size="md"
            className="flex-1"
            disabled={!isActive || rotate.isPending}
            loading={rotate.isPending}
            onClick={handleRotate}
          >
            <RefreshCw className="mr-1.5 size-4" />
            Regenerate Key
          </AppButton>
          <AppButton
            variant="danger"
            size="md"
            disabled={!isActive || revoke.isPending}
            onClick={() => setConfirmRevoke(true)}
            aria-label="Revoke API key"
          >
            <Trash2 className="size-4" />
          </AppButton>
        </div>
      )}

      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{apiKey.name}&rdquo; will stop working immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoke.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleRevoke}
              disabled={revoke.isPending}
            >
              {revoke.isPending ? "Revoking…" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ApiKeyCard;
