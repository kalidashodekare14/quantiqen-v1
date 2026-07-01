export type NotificationType =
  "New Risk" | "Decision Generated" | "API Limit Warning" | "Subscription Expiry" | "System Update";

export type NotificationSeverity = "info" | "warning" | "critical" | "success";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  severity: NotificationSeverity;
  read: boolean;
}

export interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}
