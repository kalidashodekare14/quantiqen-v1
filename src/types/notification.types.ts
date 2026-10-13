import type { NotificationStream, NotificationType } from "@/types/platform/notification-api.types";
import type { EventSeverity } from "@/types/severity.types";

export interface InboxNotification {
  id: string;
  type: NotificationType;
  label: string;
  title: string;
  message: string;
  severity: EventSeverity;
  stream: NotificationStream;
  read: boolean;
  link: string;
  createdAt: string;
}
