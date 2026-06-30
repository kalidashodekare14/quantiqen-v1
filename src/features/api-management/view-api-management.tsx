"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { useApiManagement } from "./hooks/useApiManagement"
import ApiKeyCard from "./components/ApiKeyCard"
import ApiManagementSkeleton from "./components/ApiManagementSkeleton"

const ViewApiManagement = () => {
  const { data, isLoading, isError } = useApiManagement()

  if (isLoading) {
    return <ApiManagementSkeleton />
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
      <PageHeader
        title="API Management"
        subtitle="Manage your API keys and monitor usage"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.apiKeys.map((key) => (
          <ApiKeyCard key={key.id} apiKey={key} />
        ))}
      </div>
    </div>
  )
}

export default ViewApiManagement
