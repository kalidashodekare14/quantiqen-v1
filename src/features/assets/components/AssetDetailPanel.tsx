"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Plus, Trash2, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUSTOM_RELATIONSHIP_TYPE, RELATIONSHIP_TYPES } from "@/constants/assets";
import { useRole } from "@/hooks/use-role";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import {
  useAssetDetail,
  useAssetRelationships,
  useAssets,
  useCreateAssetRelationship,
  useDeleteAsset,
  useDeleteAssetRelationship,
  useUpdateAsset,
} from "../hooks/useAssets";
import { assetStatusStyles, criticalityStyles } from "./AssetTable";
import AssetFormDialog from "./AssetFormDialog";

interface AssetDetailPanelProps {
  assetId: string;
  onClose: () => void;
}

function isConflictError(err: unknown): boolean {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { status?: number } }).response;
    return response?.status === 409;
  }
  return false;
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-card-foreground text-sm">{value ?? "—"}</p>
    </div>
  );
}

const AssetDetailPanel = ({ assetId, onClose }: AssetDetailPanelProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [childAssetId, setChildAssetId] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [customRelationshipType, setCustomRelationshipType] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const { data: asset, isLoading, isError, refetch } = useAssetDetail(assetId);
  const { data: relationships, isLoading: relationshipsLoading } =
    useAssetRelationships(assetId);
  const { data: allAssets } = useAssets();
  const deleteAsset = useDeleteAsset();
  const updateAsset = useUpdateAsset();
  const createRelationship = useCreateAssetRelationship();
  const deleteRelationship = useDeleteAssetRelationship();

  const assetNameById = new Map(allAssets?.map((item) => [item.id, item.name]));

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const handleScanToggle = (checked: boolean) => {
    updateAsset.mutate(
      { id: assetId, body: { scanEnabled: checked } },
      {
        onSuccess: () =>
          toast.success(
            checked
              ? "Scanning enabled — this asset can now be scanned."
              : "Scanning disabled — scan policies and triggers are blocked.",
          ),
        onError: handleError,
      },
    );
  };

  const handleDelete = () => {
    deleteAsset.mutate(assetId, {
      onSuccess: () => {
        toast.success("Asset deleted.");
        setConfirmDelete(false);
        onClose();
      },
      onError: (error) => {
        setConfirmDelete(false);
        handleError(error);
      },
    });
  };

  const handleAddRelationship = () => {
    setFormError(null);
    if (!childAssetId) {
      setFormError("Select a related asset.");
      return;
    }
    if (childAssetId === assetId) {
      setFormError("An asset cannot relate to itself.");
      return;
    }

    const isCustomType = relationshipType === CUSTOM_RELATIONSHIP_TYPE;
    const typeValue = isCustomType ? customRelationshipType.trim() : relationshipType;

    if (!typeValue) {
      setFormError(isCustomType ? "Custom relationship type is required." : "Relationship type is required.");
      return;
    }
    if (typeValue.length > 100) {
      setFormError("Relationship type must be 100 characters or fewer.");
      return;
    }

    const isDuplicate = relationships?.some(
      (relationship) =>
        relationship.parentAssetId === assetId &&
        relationship.childAssetId === childAssetId &&
        relationship.relationshipType === typeValue,
    );
    if (isDuplicate) {
      setFormError("This relationship already exists.");
      return;
    }

    createRelationship.mutate(
      {
        id: assetId,
        body: { parentAssetId: assetId, childAssetId, relationshipType: typeValue },
      },
      {
        onSuccess: () => {
          toast.success("Relationship created.");
          setChildAssetId("");
          setRelationshipType("");
          setCustomRelationshipType("");
        },
        onError: (error) =>
          setFormError(
            isConflictError(error)
              ? "This relationship already exists."
              : getFriendlyError(error).message,
          ),
      },
    );
  };

  const handleRemoveRelationship = (relationshipId: string) => {
    deleteRelationship.mutate(
      { relationshipId, assetId },
      {
        onSuccess: () => toast.success("Relationship removed."),
        onError: handleError,
      },
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-40 bg-black"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-card fixed inset-y-0 right-0 z-50 flex w-full flex-col sm:w-120"
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-6 py-5">
          <div className="min-w-0">
            <p className="text-card-foreground truncate text-lg font-semibold">
              {asset?.name ?? "Asset"}
            </p>
            <p className="text-muted-foreground mt-0.5 truncate font-mono text-xs">{assetId}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {isAdmin && asset && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit asset"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="text-muted-foreground size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete asset"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
              <X className="text-muted-foreground size-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : isError || !asset ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-muted-foreground text-sm">Unable to load this asset.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${criticalityStyles[asset.criticality] ?? "bg-muted text-muted-foreground"}`}
                >
                  {asset.criticality}
                </span>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${assetStatusStyles[asset.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {asset.status}
                </span>
                <Badge variant="outline">{asset.environment}</Badge>
                {asset.discovered && <Badge variant="secondary">Discovered</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailField label="Type" value={asset.assetType.replaceAll("_", " ")} />
                <DetailField label="Identifier" value={<span className="font-mono">{asset.identifier}</span>} />
                <DetailField label="Data sensitivity" value={`${asset.dataSensitivity}/10`} />
                <DetailField label="Owner" value={asset.ownerUserId ?? "Unassigned"} />
                <DetailField
                  label="First seen"
                  value={asset.firstSeenAt ? formatDateTime(asset.firstSeenAt) : "—"}
                />
                <DetailField
                  label="Last seen"
                  value={asset.lastSeenAt ? formatDateTime(asset.lastSeenAt) : "—"}
                />
                <DetailField
                  label="Created"
                  value={formatDateTime(asset.createdAt)}
                />
                <DetailField
                  label="Updated"
                  value={formatDateTime(asset.updatedAt)}
                />
              </div>

              {asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {asset.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="border-border flex items-center justify-between gap-3 border-t pt-4">
                <div className="min-w-0">
                  <p className="text-card-foreground text-sm font-medium">Scanning</p>
                  <p className="text-muted-foreground text-xs">
                    {asset.scanEnabled
                      ? "Opted in — scan policies and triggers can target this asset."
                      : "Not opted in — scan policies and triggers are blocked until enabled."}
                  </p>
                </div>
                {isAdmin ? (
                  <Switch
                    checked={asset.scanEnabled}
                    onCheckedChange={handleScanToggle}
                    disabled={updateAsset.isPending}
                    aria-label="Toggle scan opt-in"
                  />
                ) : (
                  <Badge variant={asset.scanEnabled ? "secondary" : "outline"}>
                    {asset.scanEnabled ? "Enabled" : "Not opted in"}
                  </Badge>
                )}
              </div>

              <div className="border-border border-t pt-4">
                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                  Relationships ({relationships?.length ?? 0})
                </p>

                {relationshipsLoading ? (
                  <p className="text-muted-foreground text-sm">Loading relationships…</p>
                ) : !relationships || relationships.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No relationships yet.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {relationships.map((relationship) => {
                      const isParent = relationship.parentAssetId === assetId;
                      const relatedId = isParent
                        ? relationship.childAssetId
                        : relationship.parentAssetId;
                      const relatedName = assetNameById.get(relatedId) ?? relatedId;

                      return (
                        <div
                          key={relationship.id}
                          className="bg-muted/50 flex items-center justify-between gap-2 rounded-lg px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-card-foreground truncate text-sm">
                              {isParent ? "→ " : "← "}
                              {relatedName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {relationship.relationshipType}
                            </p>
                          </div>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveRelationship(relationship.id)}
                              disabled={deleteRelationship.isPending}
                              aria-label="Remove relationship"
                            >
                              <Trash2 className="text-destructive size-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {isAdmin && (
                  <div className="bg-muted/50 mt-3 flex flex-col gap-2 rounded-lg p-3">
                    <p className="text-card-foreground text-sm font-medium">Add relationship</p>
                    <div className="flex gap-2">
                      <Select value={childAssetId} onValueChange={setChildAssetId}>
                        <SelectTrigger className="h-9 flex-1" aria-label="Related asset">
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                          {allAssets
                            ?.filter((item) => item.id !== assetId)
                            .map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Select value={relationshipType} onValueChange={setRelationshipType}>
                        <SelectTrigger className="h-9 w-44" aria-label="Relationship type">
                          <SelectValue placeholder="Relationship type" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                          <SelectItem value={CUSTOM_RELATIONSHIP_TYPE}>
                            {CUSTOM_RELATIONSHIP_TYPE}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {relationshipType === CUSTOM_RELATIONSHIP_TYPE && (
                      <Input
                        placeholder="custom type (e.g. federates)"
                        value={customRelationshipType}
                        onChange={(e) => setCustomRelationshipType(e.target.value)}
                        maxLength={100}
                        className="h-9"
                      />
                    )}
                    {formError && <p className="text-destructive text-xs">{formError}</p>}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleAddRelationship}
                        disabled={createRelationship.isPending}
                      >
                        <Plus className="mr-1 size-3.5" />
                        {createRelationship.isPending ? "Adding…" : "Add"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {editOpen && asset && (
        <AssetFormDialog open={editOpen} onClose={() => setEditOpen(false)} asset={asset} />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              {asset?.name} will be removed from your inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAsset.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAsset.isPending}
            >
              {deleteAsset.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatePresence>
  );
};

export default AssetDetailPanel;
