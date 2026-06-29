"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Info, CheckCircle, AlertTriangle, AlertOctagon } from "lucide-react"
import { Notification } from "@/types/notification.types"

interface NotificationListProps {
  notifications: Notification[]
}

function getRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

const severityConfig: Record<string, { icon: React.ElementType; className: string }> = {
  info: { icon: Info, className: "bg-chart-5/10 text-chart-5" },
  success: { icon: CheckCircle, className: "bg-chart-2/10 text-chart-2" },
  warning: { icon: AlertTriangle, className: "bg-chart-3/10 text-chart-3" },
  critical: { icon: AlertOctagon, className: "bg-destructive/10 text-destructive" },
}

const typeBadgeStyles: Record<string, string> = {
  "New Risk": "bg-destructive/10 text-destructive",
  "Decision Generated": "bg-chart-2/10 text-chart-2",
  "API Limit Warning": "bg-chart-3/10 text-chart-3",
  "Subscription Expiry": "bg-chart-3/10 text-chart-3",
  "System Update": "bg-chart-5/10 text-chart-5",
}

export const NotificationList = ({ notifications }: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No notifications
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <AnimatePresence>
        {notifications.map((notification, index) => {
          const SeverityIcon = severityConfig[notification.severity].icon
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-card border rounded-xl px-5 py-4 flex items-start gap-4 ${
                notification.read
                  ? "border-l-2 border-l-transparent"
                  : "border-l-2 border-l-chart-5"
              }`}
            >
              <div
                className={`size-9 rounded-full flex items-center justify-center shrink-0 ${severityConfig[notification.severity].className}`}
              >
                <SeverityIcon className="size-4" />
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-card-foreground">
                    {notification.title}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {getRelativeTime(notification.timestamp)}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${typeBadgeStyles[notification.type] ?? ""}`}
                >
                  {notification.type}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notification.message}
                </p>
              </div>

              {!notification.read && (
                <div className="size-2 rounded-full bg-chart-5 shrink-0 mt-1" />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
