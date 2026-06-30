"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-card-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </motion.div>
  )
}
