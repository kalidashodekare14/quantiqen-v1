"use client"

import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { PageHeader } from "@/components/shared/PageHeader"
import { useNotifications } from "./hooks/useNotifications"
import { NotificationList } from "./components/NotificationList"

export const ViewNotifications = () => {
  const { data, isLoading, isError } = useNotifications()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <LoadingSkeleton variant="page" />
      </div>
    )
  }

  if (isError) return null
  if (!data) return null

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with latest alerts"
        action={
          <span className="text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-full">
            {data.unreadCount} Unread
          </span>
        }
      />
      <NotificationList notifications={data.notifications} />
    </div>
  )
}
