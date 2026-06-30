"use client"

import { motion } from "framer-motion"
import { Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Recommendation } from "@/types/recommendation.types"

interface RecommendationCardProps {
  recommendation: Recommendation
}

const severityStyles: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-chart-3/10 text-chart-3",
  Medium: "bg-chart-5/10 text-chart-5",
  Low: "bg-muted text-muted-foreground",
}

const statusStyles: Record<string, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  "In Progress": "bg-chart-5/10 text-chart-5",
}

const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs lg:text-sm text-muted-foreground">{recommendation.id}</span>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs lg:text-sm font-medium ${
            statusStyles[recommendation.status]
          }`}
        >
          {recommendation.status}
        </span>
      </div>

      <p className="text-sm lg:text-base font-semibold leading-snug text-card-foreground">
        {recommendation.recommendation}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs lg:text-sm font-medium ${
            severityStyles[recommendation.businessImpact]
          }`}
        >
          {recommendation.businessImpact}
        </span>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs lg:text-sm font-medium ${
            severityStyles[recommendation.priority]
          }`}
        >
          {recommendation.priority}
        </span>
        <span className="text-xs lg:text-sm text-card-foreground">{recommendation.confidence}%</span>
      </div>

      <div className="space-y-1.5 text-xs lg:text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-3.5" />
          <span>{recommendation.estimatedFixTime}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-3.5" />
          <span>{recommendation.responsibleTeam}</span>
        </div>
      </div>

      <Button variant="default" size="sm" className="w-full">
        Take Action
      </Button>
    </motion.div>
  )
}

export default RecommendationCard
