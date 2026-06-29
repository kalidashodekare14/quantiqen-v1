"use client"

import { useOrganization } from "./hooks/useOrganization"
import { OrgHeader } from "./components/OrgHeader"
import { OrgDetails } from "./components/OrgDetails"

export const ViewOrganization = () => {
  const { data, isLoading, isError } = useOrganization()

  if (isLoading) return null
  if (isError) return null
  if (!data) return null

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-card-foreground">
          Organization
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization profile
        </p>
      </div>
      <OrgHeader data={data} />
      <OrgDetails data={data} />
    </div>
  )
}
