"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatPills } from "@/components/shared/StatPills";
import AppButton from "@/components/shared/AppButton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Server, CheckCircle, MinusCircle, HelpCircle } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import type {
  AssetCriticality,
  AssetEnvironment,
  AssetListParams,
  AssetStatus,
  AssetType,
  PlatformAsset,
} from "@/types/platform/asset-api.types";
import { useAssets } from "./hooks/useAssets";
import AssetTable from "./components/AssetTable";
import AssetsSkeleton from "./components/AssetsSkeleton";

const AssetFormDialog = dynamic(() => import("./components/AssetFormDialog"), { ssr: false });
const AssetDetailPanel = dynamic(() => import("./components/AssetDetailPanel"), { ssr: false });

const ASSET_TYPES: AssetType[] = [
  "DOMAIN",
  "IP",
  "URL",
  "CIDR",
  "CLOUD_RESOURCE",
  "SERVICE",
  "OTHER",
];
const STATUSES: AssetStatus[] = ["ACTIVE", "INACTIVE", "UNKNOWN"];
const CRITICALITIES: AssetCriticality[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNRATED"];
const ENVIRONMENTS: AssetEnvironment[] = ["PRODUCTION", "STAGING", "DEVELOPMENT", "UNKNOWN"];

const ViewAssets = () => {
  const [assetType, setAssetType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [criticality, setCriticality] = useState("ALL");
  const [environment, setEnvironment] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const filters: AssetListParams = {
    ...(assetType !== "ALL" ? { assetType: assetType as AssetType } : {}),
    ...(status !== "ALL" ? { status: status as AssetStatus } : {}),
    ...(criticality !== "ALL" ? { criticality: criticality as AssetCriticality } : {}),
    ...(environment !== "ALL" ? { environment: environment as AssetEnvironment } : {}),
  };

  const { data: allAssets, isLoading: isLoadingMeta } = useAssets();
  const { data: assets, isLoading, isError, refetch } = useAssets(filters);

  if (isLoading || isLoadingMeta) {
    return <AssetsSkeleton />;
  }

  const meta = {
    total: allAssets?.length ?? 0,
    active: allAssets?.filter((a) => a.status === "ACTIVE").length ?? 0,
    inactive: allAssets?.filter((a) => a.status === "INACTIVE").length ?? 0,
    unknown: allAssets?.filter((a) => a.status === "UNKNOWN").length ?? 0,
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Asset Inventory"
        subtitle="View and manage your organization's assets"
        action={
          isAdmin && (
            <AppButton variant="primary" size="md" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add Asset
            </AppButton>
          )
        }
      />

      <StatPills
        stats={[
          { value: meta.total.toLocaleString(), label: "Total Assets", icon: Server },
          { value: meta.active.toLocaleString(), label: "Active", color: "success", icon: CheckCircle },
          { value: meta.inactive.toLocaleString(), label: "Inactive", icon: MinusCircle },
          { value: meta.unknown.toLocaleString(), label: "Unknown", color: "warning", icon: HelpCircle },
        ]}
      />

      <div className="bg-card flex flex-wrap items-end gap-3 rounded-xl p-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Type</span>
          <Select value={assetType} onValueChange={setAssetType}>
            <SelectTrigger className="h-9 w-44" aria-label="Filter by asset type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {ASSET_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Status</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-36" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Criticality</span>
          <Select value={criticality} onValueChange={setCriticality}>
            <SelectTrigger className="h-9 w-36" aria-label="Filter by criticality">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All criticalities</SelectItem>
              {CRITICALITIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Environment</span>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="h-9 w-40" aria-label="Filter by environment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All environments</SelectItem>
              {ENVIRONMENTS.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(assetType !== "ALL" || status !== "ALL" || criticality !== "ALL" || environment !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAssetType("ALL");
              setStatus("ALL");
              setCriticality("ALL");
              setEnvironment("ALL");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {isError ? (
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="text-destructive text-sm">Failed to load assets. Please try again later.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <AssetTable
          assets={assets ?? []}
          onRowClick={(asset: PlatformAsset) => setSelectedAssetId(asset.id)}
        />
      )}

      {createOpen && (
        <AssetFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      )}

      {selectedAssetId && (
        <AssetDetailPanel
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
        />
      )}
    </div>
  );
};

export default ViewAssets;
