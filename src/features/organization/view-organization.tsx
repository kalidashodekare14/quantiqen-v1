"use client"

import Link from "next/link"
import { Users, Shield, ScrollText, BookOpen, ListChecks, ClipboardCheck, UsersRound } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { QueryErrorState } from "@/components/shared/QueryErrorState"
import { RequireRole } from "@/components/auth/RequireRole"
import { useOrganization } from "./hooks/useOrganization"
import { useUsers } from "@/hooks/use-users"
import { useAssets } from "@/features/assets/hooks/useAssets"
import { useApiManagement } from "@/features/api-management/hooks/useApiManagement"
import { OrgHeader } from "./components/OrgHeader"
import { OrgDetails } from "./components/OrgDetails"
import OrganizationSkeleton from "./components/OrganizationSkeleton"
import { routes } from "@/constants/routes"

const managementCards = [
  {
    title: "User Management",
    description: "Create and manage organization users, roles, and permissions",
    href: routes.organizationUsers,
    icon: Users,
  },
  {
    title: "Teams",
    description: "Manage teams, members, and leads for decision ownership",
    href: routes.organizationTeams,
    icon: UsersRound,
  },
  {
    title: "Sessions",
    description: "View and revoke active user sessions",
    href: routes.organizationSessions,
    icon: Shield,
  },
  {
    title: "Policy",
    description: "Configure MFA policy and IP whitelist settings",
    href: routes.organizationPolicy,
    icon: ScrollText,
  },
  {
    title: "Guardrail Policies",
    description: "Define decision guardrails, activate versions, and review history",
    href: routes.organizationGuardrails,
    icon: ListChecks,
  },
  {
    title: "Compliance",
    description: "Browse compliance frameworks and control coverage",
    href: routes.organizationCompliance,
    icon: ClipboardCheck,
  },
  {
    title: "Audit Log",
    description: "View organization activity and security events",
    href: routes.organizationAuditLog,
    icon: BookOpen,
    allowedRoles: ["CUSTOMER_ADMIN", "ANALYST", "AUDITOR"] as const,
  },
]

export const ViewOrganization = () => {
  const { data: org, isLoading: orgLoading, isError, error } = useOrganization()
  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: assets, isLoading: assetsLoading } = useAssets()
  const { data: apiKeys, isLoading: apiKeysLoading } = useApiManagement()

  if (orgLoading || usersLoading || assetsLoading || apiKeysLoading) {
    return <OrganizationSkeleton />
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageHeader
          title="Organization"
          subtitle="Manage your organization profile and settings"
        />
        <QueryErrorState
          error={error}
          message="Failed to load organization. Please try again."
        />
      </div>
    )
  }
  if (!org) return null

  const counts = {
    users: users?.length ?? 0,
    assets: assets?.length ?? 0,
    domains: assets?.filter((asset) => asset.assetType === "DOMAIN").length ?? 0,
    apiKeys: apiKeys?.length ?? 0,
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Organization"
        subtitle="Manage your organization profile and settings"
      />
      <OrgHeader data={org} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {managementCards.map((card) => {
          const Icon = card.icon
          const content = (
            <Link
              key={card.href}
              href={card.href}
              className="bg-card/80 border-foreground/10 hover:border-primary/40 hover:shadow-primary/5 group rounded-xl border p-6 backdrop-blur-md transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary rounded-lg p-3 transition-colors group-hover:bg-primary/20">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {card.description}
                  </p>
                </div>
              </div>
            </Link>
          )

          if ("allowedRoles" in card && card.allowedRoles) {
            return (
              <RequireRole key={card.href} allowedRoles={[...card.allowedRoles]}>
                {content}
              </RequireRole>
            )
          }

          return content
        })}
      </div>

      <OrgDetails org={org} counts={counts} />
    </div>
  )
}
