"use client"

import { motion } from "framer-motion"
import { OrganizationData } from "@/types/organization.types"

interface OrgHeaderProps {
  data: OrganizationData
}

const statusStyles: Record<string, string> = {
  Active: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Trial: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Expired: "bg-destructive/10 text-destructive border-destructive/20",
}

export const OrgHeader = ({ data }: OrgHeaderProps) => {
  const statusClass = statusStyles[data.subscription.status] ?? ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border rounded-xl p-6 w-full"
    >
      <div className="flex items-center gap-5">
        <div className="size-16 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center">
          <span className="text-2xl font-bold text-chart-5">
            {data.name.charAt(0)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-card-foreground">{data.name}</h2>
          <p className="text-sm lg:text-base text-muted-foreground">{data.industry}</p>

          <div className="flex items-center gap-3">
            <span className="bg-chart-5/10 text-chart-5 border border-chart-5/20 text-xs lg:text-sm font-medium px-2.5 py-1 rounded-full">
              {data.plan}
            </span>
            <span
              className={`text-xs lg:text-sm font-medium px-2.5 py-1 rounded-full border ${statusClass}`}
            >
              {data.subscription.status}
            </span>
            <a
              href={data.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs lg:text-sm text-muted-foreground hover:text-chart-5 transition-colors"
            >
              {data.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
