import notificationsData from "@/mock-data/notifications.json";

import { NotificationsData } from "@/types/notification.types";

export const notificationService = async (): Promise<NotificationsData> => {
  return notificationsData as unknown as NotificationsData;
};
