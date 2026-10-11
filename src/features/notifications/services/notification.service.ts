import { platformApi } from "@/lib/platform-axios";
import type {
  NotificationInboxListResponse,
  NotificationInboxParams,
  NotificationLog,
  ReadAllResponse,
  UnreadCountResponse,
} from "@/types/platform/notification-api.types";

export const notificationService = {
  list: async (params: NotificationInboxParams = {}): Promise<NotificationInboxListResponse> => {
    const res = await platformApi.get<NotificationInboxListResponse>("/notifications", { params });
    return res.data;
  },

  unreadCount: async (): Promise<UnreadCountResponse> => {
    const res = await platformApi.get<UnreadCountResponse>("/notifications/unread-count");
    return res.data;
  },

  markRead: async (id: string): Promise<NotificationLog> => {
    const res = await platformApi.post<NotificationLog>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async (): Promise<ReadAllResponse> => {
    const res = await platformApi.post<ReadAllResponse>("/notifications/read-all");
    return res.data;
  },
};
