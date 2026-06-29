"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useAssets } from "./hooks/useAssets"
import AssetTable from "./components/AssetTable"

const ViewAssets = () => {
  const { data, isLoading, isError } = useAssets()

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col gap-6">
        <h1 className="text-xl font-bold text-card-foreground">Asset Inventory</h1>
        <p className="text-destructive">Failed to load assets. Please try again later.</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">Asset Inventory</h1>
        <p className="text-sm text-muted-foreground">
          View and manage your organization&apos;s assets
        </p>
      </div>
      <AssetTable assets={data.assets} />
    </div>
  )
}

export default ViewAssets
