"use client"

import { useNotifications } from "./hooks/useNotifications"
import { NotificationList } from "./components/NotificationList"

export const ViewNotifications = () => {
  const { data, isLoading, isError } = useNotifications()

  if (isLoading) return null
  if (isError) return null
  if (!data) return null

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-card-foreground">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Stay updated with latest alerts
          </p>
        </div>
        <span className="text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-full">
          {data.unreadCount} Unread
        </span>
      </div>
      <NotificationList notifications={data.notifications} />
    </div>
  )
}
