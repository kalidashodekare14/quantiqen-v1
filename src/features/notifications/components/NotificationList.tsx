"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { severityConfig } from "@/constants/severity";
import { formatRelativeTime } from "@/utils/date/date";
import { fadeInUp } from "@/lib/motion";
import type { NotificationType } from "@/types/platform/notification-api.types";
import type { InboxNotification } from "@/types/notification.types";

interface NotificationListProps {
  notifications: InboxNotification[];
  canMarkRead: boolean;
  onMarkRead: (id: string) => void;
}

const typeBadgeStyles: Record<NotificationType, string> = {
  CRITICAL_RISK_DETECTED: "bg-destructive/10 text-destructive",
  NEW_DECISION_READY: "bg-chart-2/10 text-chart-2",
  CRITICAL_ASSET_EXPOSURE: "bg-destructive/10 text-destructive",
  API_USAGE_WARNING: "bg-chart-3/10 text-chart-3",
  INTEGRATION_FAILURE: "bg-chart-3/10 text-chart-3",
  SCAN_COMPLETED: "bg-chart-5/10 text-chart-5",
  SUBSCRIPTION_WARNING: "bg-chart-3/10 text-chart-3",
  REMEDIATION_SUBMITTED: "bg-muted text-muted-foreground",
  DECISION_SLA_BREACHED: "bg-destructive/10 text-destructive",
  VERIFICATION_COMPLETED: "bg-chart-2/10 text-chart-2",
};

export const NotificationList = ({
  notifications,
  canMarkRead,
  onMarkRead,
}: NotificationListProps) => {
  const router = useRouter();

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
              {...fadeInUp(index * 0.05)}
              onClick={() => router.push(notification.link)}
              className={`bg-card/80 backdrop-blur-md border border-foreground/10 flex items-start gap-4 rounded-xl px-5 py-4 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer ${
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
                  <span className="text-card-foreground text-sm font-semibold lg:text-base">
                    {notification.title}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs lg:text-sm">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${typeBadgeStyles[notification.type]}`}
                  >
                    {notification.label}
                  </span>
                  <span className="text-muted-foreground w-fit rounded-full bg-muted px-2 py-0.5 text-xs font-medium lg:text-sm">
                    {notification.stream}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed lg:text-base">
                  {notification.message}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                {!notification.read && (
                  <div className="bg-chart-5 mt-1 size-2 shrink-0 rounded-full" />
                )}
                {canMarkRead && !notification.read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMarkRead(notification.id);
                    }}
                  >
                    <Check className="size-3.5" />
                    Mark read
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
