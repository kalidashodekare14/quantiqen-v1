"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Notification } from "@/types/notification.types";
import { severityConfig } from "@/constants/severity";
import { formatRelativeTime } from "@/utils/date/date";

interface NotificationListProps {
  notifications: Notification[];
}

const typeBadgeStyles: Record<string, string> = {
  "New Risk": "bg-destructive/10 text-destructive",
  "Decision Generated": "bg-chart-2/10 text-chart-2",
  "API Limit Warning": "bg-chart-3/10 text-chart-3",
  "Subscription Expiry": "bg-chart-3/10 text-chart-3",
  "System Update": "bg-chart-5/10 text-chart-5",
};

export const NotificationList = ({ notifications }: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-12">
        No notifications
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <AnimatePresence>
        {notifications.map((notification, index) => {
          const SeverityIcon = severityConfig[notification.severity].icon;
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-card flex items-start gap-4 rounded-xl border px-5 py-4 ${
                notification.read
                  ? "border-l-2 border-l-transparent"
                  : "border-l-chart-5 border-l-2"
              }`}
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${severityConfig[notification.severity].className}`}
              >
                <SeverityIcon className="size-4" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-card-foreground text-sm font-semibold">
                    {notification.title}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatRelativeTime(notification.timestamp)}
                  </span>
                </div>
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeStyles[notification.type] ?? ""}`}
                >
                  {notification.type}
                </span>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {notification.message}
                </p>
              </div>

              {!notification.read && (
                <div className="bg-chart-5 mt-1 size-2 shrink-0 rounded-full" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
