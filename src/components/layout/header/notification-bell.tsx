"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

export function NotificationBell() {
  const { data } = useNotifications();
  const unread = data?.unreadCount ?? 0;

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href={routes.notifications}>
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-tight">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
    </Button>
  );
}
