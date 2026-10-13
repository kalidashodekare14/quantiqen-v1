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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFriendlyError } from "@/utils/errorMessages";
import type { CreateApiKeyRequest } from "@/types/platform/api-key.types";
import { useCreateApiKey } from "../hooks/useApiManagement";

interface CreateApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (rawKey: string) => void;
}

const ENVIRONMENTS: CreateApiKeyRequest["environment"][] = ["live", "test", "dev"];

const CreateApiKeyDialog = ({ open, onClose, onCreated }: CreateApiKeyDialogProps) => {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<CreateApiKeyRequest["environment"]>("test");
  const [scopes, setScopes] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  const createApiKey = useCreateApiKey();

  const resetAndClose = () => {
    setName("");
    setScopes("");
    setErrorText(null);
    onClose();
  };

  const handleSubmit = () => {
    setErrorText(null);
    if (!name.trim()) {
      setErrorText("Name is required.");
      return;
    }

    const parsedScopes = scopes
      .split(",")
      .map((scope) => scope.trim())
      .filter(Boolean);

    createApiKey.mutate(
      {
        name: name.trim(),
        environment,
        ...(parsedScopes.length > 0 ? { scopes: parsedScopes } : {}),
      },
      {
        onSuccess: (created) => {
          toast.success("API key created.");
          resetAndClose();
          onCreated(created.rawKey);
        },
        onError: (error) => setErrorText(getFriendlyError(error).message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
          <DialogDescription>
            The raw key is displayed once immediately after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="api-key-name">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="api-key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ingestion pipeline"
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="api-key-environment">
              Environment <span className="text-destructive">*</span>
            </label>
            <Select
              value={environment}
              onValueChange={(v) => setEnvironment(v as CreateApiKeyRequest["environment"])}
            >
              <SelectTrigger id="api-key-environment" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENVIRONMENTS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="api-key-scopes">
              Scopes (comma separated)
            </label>
            <Input
              id="api-key-scopes"
              value={scopes}
              onChange={(e) => setScopes(e.target.value)}
              placeholder="e.g. events:write"
              className="font-mono"
            />
          </div>
        </div>

        {errorText && <p className="text-destructive text-sm">{errorText}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createApiKey.isPending}>
            {createApiKey.isPending ? "Creating…" : "Create key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateApiKeyDialog;
