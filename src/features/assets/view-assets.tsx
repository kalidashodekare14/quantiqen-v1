"use client";

import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAssets } from "./hooks/useAssets";
import AssetTable from "./components/AssetTable";

const ViewAssets = () => {
  const { data, isLoading, isError } = useAssets();

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <LoadingSkeleton variant="table" count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col gap-6">
        <h1 className="text-card-foreground text-xl font-bold">Asset Inventory</h1>
        <p className="text-destructive">Failed to load assets. Please try again later.</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader title="Asset Inventory" subtitle="View and manage your organization's assets" />
      <AssetTable assets={data.assets} />
    </div>
  );
};

export default ViewAssets;
