"use client";

import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/hooks/use-role";
import { getFriendlyError } from "@/utils/errorMessages";
import type { NotificationStream } from "@/types/platform/notification-api.types";
import { NotificationList } from "./components/NotificationList";
import NotificationsSkeleton from "./components/NotificationsSkeleton";
import { mapInboxNotification } from "./utils/map-inbox-notification";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotificationList,
  useUnreadCount,
} from "./hooks/useNotifications";

const PAGE_SIZE = 20;

type StreamFilter = "ALL" | NotificationStream;
type StatusFilter = "ALL" | "UNREAD";

export const ViewNotifications = () => {
  const [stream, setStream] = useState<StreamFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { hasAnyRole, isAdmin } = useRole();
  const canMarkRead = hasAnyRole(["CUSTOMER_ADMIN", "ANALYST"]);

  const params = {
    page,
    limit: PAGE_SIZE,
    ...(stream !== "ALL" ? { stream } : {}),
    ...(status === "UNREAD" ? { unreadOnly: true } : {}),
  };

  const { data, isLoading, isError, refetch } = useNotificationList(params);
  const { data: unread } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  const unreadCount = unread?.count ?? 0;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const handleFilterChange = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const handleMarkRead = (id: string) => {
    markRead.mutate(id, {
      onError: (error) => toast.error(getFriendlyError(error).message),
    });
  };

  const handleMarkAll = () => {
    markAll.mutate(undefined, {
      onSuccess: (result) => {
        setConfirmOpen(false);
        toast.success(
          result.count > 0
            ? `${result.count} notification${result.count === 1 ? "" : "s"} marked as read`
            : "All notifications are already read",
        );
      },
      onError: (error) => {
        setConfirmOpen(false);
        toast.error(getFriendlyError(error).message);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with latest alerts"
        action={
          <span className="text-xs lg:text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-full">
            {unreadCount} Unread
          </span>
        }
      />

      <div className="bg-card flex flex-wrap items-center gap-3 rounded-xl p-3">
        <Select value={stream} onValueChange={handleFilterChange<StreamFilter>(setStream)}>
          <SelectTrigger className="h-9 w-44" aria-label="Filter by stream">
            <SelectValue placeholder="All streams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All streams</SelectItem>
            <SelectItem value="SECURITY">Security</SelectItem>
            <SelectItem value="OPERATIONS">Operations</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleFilterChange<StatusFilter>(setStatus)}>
          <SelectTrigger className="h-9 w-44" aria-label="Filter by read status">
            <SelectValue placeholder="All notifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All notifications</SelectItem>
            <SelectItem value="UNREAD">Unread only</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              disabled={unreadCount === 0 || markAll.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              Mark all as read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="bg-card/80 border border-foreground/10 flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">Unable to load notifications.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <NotificationList
          notifications={(data?.items ?? []).map((log) => mapInboxNotification(log))}
          canMarkRead={canMarkRead}
          onMarkRead={handleMarkRead}
        />
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark all notifications as read?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears the unread badge for the entire organization. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAll}>Mark all as read</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
