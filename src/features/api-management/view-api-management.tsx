"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useApiManagement } from "./hooks/useApiManagement"
import ApiKeyCard from "./components/ApiKeyCard"

const ViewApiManagement = () => {
  const { data, isLoading, isError } = useApiManagement()

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-7 w-72" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col gap-6">
        <h1 className="text-xl font-bold text-card-foreground">API Management</h1>
        <p className="text-destructive">Failed to load API keys. Please try again later.</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">API Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage your API keys and monitor usage
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.apiKeys.map((key) => (
          <ApiKeyCard key={key.id} apiKey={key} />
        ))}
      </div>
    </div>
  )
}

export default ViewApiManagement
