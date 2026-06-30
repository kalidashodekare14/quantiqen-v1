"use client"

import { motion } from "framer-motion"
import { Users, Server, Globe, Key } from "lucide-react"
import { OrganizationData } from "@/types/organization.types"

interface OrgDetailsProps {
  data: OrganizationData
}

export const OrgDetails = ({ data }: OrgDetailsProps) => {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })

  const formatMemberSince = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })

  const sections = [
    {
      title: "Overview",
      delay: 0,
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, value: data.users, label: "Total Users" },
            { icon: Server, value: data.assets, label: "Total Assets" },
            { icon: Globe, value: data.domains, label: "Domains" },
            { icon: Key, value: data.apiKeys, label: "API Keys" },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="bg-card border rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="size-4 text-chart-5" />
                  <span className="text-sm lg:text-base text-muted-foreground">
                    {item.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-card-foreground">
                  {item.value}
                </p>
              </div>
            )
          })}
        </div>
      ),
    },
    {
      title: "Subscription",
      delay: 0.1,
      content: (
        <>
          <div className="bg-card border rounded-xl p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: "Plan", value: data.subscription.plan },
                { label: "Status", value: data.subscription.status },
                {
                  label: "Start Date",
                  value: formatDate(data.subscription.startDate),
                },
                {
                  label: "Expiry Date",
                  value: formatDate(data.subscription.expiryDate),
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs lg:text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-sm lg:text-base font-medium text-card-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between">
                <span className="text-xs lg:text-sm text-muted-foreground">
                  Days Remaining
                </span>
                <span className="text-xs lg:text-sm text-chart-2">
                  {data.subscription.daysRemaining} days
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full mt-2">
                <div
                  className="h-full rounded-full bg-chart-2"
                  style={{
                    width: `${Math.min((data.subscription.daysRemaining / 365) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "Details",
      delay: 0.2,
      content: (
        <div className="bg-card border rounded-xl p-5">
          {[
            { label: "Organization ID", value: data.id },
            { label: "Email", value: data.email },
            { label: "Country", value: data.country },
            {
              label: "Member Since",
              value: formatMemberSince(data.createdAt),
            },
            { label: "Website", value: data.website },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-3 ${
                idx < 4 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-sm lg:text-base text-muted-foreground">
                {item.label}
              </span>
              <span className="text-sm lg:text-base font-medium text-card-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5 w-full">
      {sections.map((section) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: section.delay }}
        >
          <h3 className="text-sm lg:text-base font-semibold text-card-foreground mb-3">
            {section.title}
          </h3>
          {section.content}
        </motion.div>
      ))}
    </div>
  )
}
