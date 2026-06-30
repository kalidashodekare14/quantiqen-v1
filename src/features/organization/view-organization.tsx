"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { useOrganization } from "./hooks/useOrganization"
import { OrgHeader } from "./components/OrgHeader"
import { OrgDetails } from "./components/OrgDetails"
import OrganizationSkeleton from "./components/OrganizationSkeleton"

export const ViewOrganization = () => {
  const { data, isLoading, isError } = useOrganization()

  if (isLoading) {
    return <OrganizationSkeleton />
  }

  if (isError) return null
  if (!data) return null

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Organization"
        subtitle="Manage your organization profile"
      />
      <OrgHeader data={data} />
      <OrgDetails data={data} />
    </div>
  )
}
