"use client"

import Link from "next/link"
import { Users, Shield, ScrollText, BookOpen } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { RequireRole } from "@/components/auth/RequireRole"
import { useOrganization } from "./hooks/useOrganization"
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
    title: "Audit Log",
    description: "View organization activity and security events",
    href: routes.organizationAuditLog,
    icon: BookOpen,
    allowedRoles: ["CUSTOMER_ADMIN", "ANALYST", "AUDITOR"] as const,
  },
]

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
        subtitle="Manage your organization profile and settings"
      />
      <OrgHeader data={data} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <OrgDetails data={data} />
    </div>
  )
}
