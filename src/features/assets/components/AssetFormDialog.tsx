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
import { useUsers } from "@/hooks/use-users";
import { getFriendlyError } from "@/utils/errorMessages";
import type {
  AssetCriticality,
  AssetEnvironment,
  AssetStatus,
  AssetType,
  CustomerImpact,
  InternetExposure,
  PlatformAsset,
  RegulatoryImpact,
} from "@/types/platform/asset-api.types";
import { useCreateAsset, useUpdateAsset } from "../hooks/useAssets";

const ASSET_TYPES: AssetType[] = [
  "DOMAIN",
  "IP",
  "URL",
  "CIDR",
  "CLOUD_RESOURCE",
  "SERVICE",
  "OTHER",
];
const ENVIRONMENTS: AssetEnvironment[] = ["PRODUCTION", "STAGING", "DEVELOPMENT", "UNKNOWN"];
const CRITICALITIES: AssetCriticality[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNRATED"];
const STATUSES: AssetStatus[] = ["ACTIVE", "INACTIVE", "UNKNOWN"];
const EXPOSURES: InternetExposure[] = ["INTERNET_FACING", "INTERNAL_ONLY", "UNKNOWN"];
const CUSTOMER_IMPACTS: CustomerImpact[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const REGULATORY_IMPACTS: RegulatoryImpact[] = ["HIGH", "MEDIUM", "LOW", "NONE"];

interface AssetFormDialogProps {
  open: boolean;
  onClose: () => void;
  asset?: PlatformAsset | null;
}

const AssetFormDialog = ({ open, onClose, asset }: AssetFormDialogProps) => {
  const isEdit = Boolean(asset);

  const [name, setName] = useState(asset?.name ?? "");
  const [assetType, setAssetType] = useState<AssetType>(asset?.assetType ?? "DOMAIN");
  const [identifier, setIdentifier] = useState(asset?.identifier ?? "");
  const [environment, setEnvironment] = useState<AssetEnvironment>(asset?.environment ?? "PRODUCTION");
  const [criticality, setCriticality] = useState<AssetCriticality>(asset?.criticality ?? "MEDIUM");
  const [dataSensitivity, setDataSensitivity] = useState(asset?.dataSensitivity ?? 5);
  const [status, setStatus] = useState<AssetStatus>(asset?.status ?? "ACTIVE");
  const [internetExposure, setInternetExposure] = useState<InternetExposure | "">("");
  const [customerImpact, setCustomerImpact] = useState<CustomerImpact | "">("");
  const [regulatoryImpact, setRegulatoryImpact] = useState<RegulatoryImpact | "">("");
  const [ownerUserId, setOwnerUserId] = useState(asset?.ownerUserId ?? "");
  const [tags, setTags] = useState(asset?.tags.join(", ") ?? "");
  const [errorText, setErrorText] = useState<string | null>(null);

  const { data: users } = useUsers();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();

  const validate = (): string | null => {
    if (!name.trim()) return "Name is required.";
    if (name.length > 200) return "Name must be 200 characters or fewer.";
    if (!identifier.trim()) return "Identifier is required.";
    if (identifier.length > 500) return "Identifier must be 500 characters or fewer.";
    if (dataSensitivity < 0 || dataSensitivity > 10) return "Data sensitivity must be 0–10.";
    return null;
  };

  const handleSubmit = () => {
    const validationError = validate();
    if (validationError) {
      setErrorText(validationError);
      return;
    }

    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const baseBody = {
      name: name.trim(),
      assetType,
      identifier: identifier.trim(),
      environment,
      criticality,
      dataSensitivity,
      ...(internetExposure ? { internetExposure } : {}),
      ...(customerImpact ? { customerImpact } : {}),
      ...(regulatoryImpact ? { regulatoryImpact } : {}),
      ...(ownerUserId ? { ownerUserId } : {}),
      ...(parsedTags.length > 0 ? { tags: parsedTags } : {}),
    };

    if (isEdit && asset) {
      updateAsset.mutate(
        { id: asset.id, body: { ...baseBody, status } },
        {
          onSuccess: () => {
            toast.success("Asset updated.");
            onClose();
          },
          onError: (error) => setErrorText(getFriendlyError(error).message),
        },
      );
    } else {
      createAsset.mutate(baseBody, {
        onSuccess: () => {
          toast.success("Asset created.");
          onClose();
        },
        onError: (error) => setErrorText(getFriendlyError(error).message),
      });
    }
  };

  const isPending = createAsset.isPending || updateAsset.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit asset" : "Add asset"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the asset details. Changes apply to your organization."
              : "Register a new asset in your organization's inventory."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-name">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="asset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              placeholder="e.g. Payment API Gateway"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-type">
              Type <span className="text-destructive">*</span>
            </label>
            <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
              <SelectTrigger id="asset-type" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-identifier">
              Identifier <span className="text-destructive">*</span>
            </label>
            <Input
              id="asset-identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              maxLength={500}
              placeholder="e.g. api.acme.example"
              className="font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-environment">
              Environment <span className="text-destructive">*</span>
            </label>
            <Select
              value={environment}
              onValueChange={(v) => setEnvironment(v as AssetEnvironment)}
            >
              <SelectTrigger id="asset-environment" className="h-9">
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
            <label className="text-sm font-medium" htmlFor="asset-criticality">
              Criticality <span className="text-destructive">*</span>
            </label>
            <Select
              value={criticality}
              onValueChange={(v) => setCriticality(v as AssetCriticality)}
            >
              <SelectTrigger id="asset-criticality" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRITICALITIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-sensitivity">
              Data sensitivity (0–10) <span className="text-destructive">*</span>
            </label>
            <Input
              id="asset-sensitivity"
              type="number"
              min={0}
              max={10}
              value={dataSensitivity}
              onChange={(e) => setDataSensitivity(Number(e.target.value))}
              className="h-9"
            />
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="asset-status">
                Status
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as AssetStatus)}>
                <SelectTrigger id="asset-status" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-exposure">
              Internet exposure
            </label>
            <Select
              value={internetExposure || "none"}
              onValueChange={(v) => setInternetExposure(v === "none" ? "" : (v as InternetExposure))}
            >
              <SelectTrigger id="asset-exposure" className="h-9">
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not set</SelectItem>
                {EXPOSURES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-customer-impact">
              Customer impact
            </label>
            <Select
              value={customerImpact || "none"}
              onValueChange={(v) => setCustomerImpact(v === "none" ? "" : (v as CustomerImpact))}
            >
              <SelectTrigger id="asset-customer-impact" className="h-9">
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not set</SelectItem>
                {CUSTOMER_IMPACTS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-regulatory-impact">
              Regulatory impact
            </label>
            <Select
              value={regulatoryImpact || "none"}
              onValueChange={(v) => setRegulatoryImpact(v === "none" ? "" : (v as RegulatoryImpact))}
            >
              <SelectTrigger id="asset-regulatory-impact" className="h-9">
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not set</SelectItem>
                {REGULATORY_IMPACTS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-owner">
              Owner
            </label>
            <Select value={ownerUserId || "none"} onValueChange={(v) => setOwnerUserId(v === "none" ? "" : v)}>
              <SelectTrigger id="asset-owner" className="h-9">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user.qipUserId} value={user.qipUserId}>
                    {user.name ?? user.email ?? user.qipUserId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="asset-tags">
              Tags (comma separated)
            </label>
            <Input
              id="asset-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. production, payments, pci"
            />
          </div>
        </div>

        {errorText && <p className="text-destructive text-sm">{errorText}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssetFormDialog;
