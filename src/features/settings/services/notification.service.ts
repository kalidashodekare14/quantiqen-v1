import { platformApi } from "@/lib/platform-axios";
import type {
  CreateWebhookRequest,
  NotificationPreference,
  UpdateWebhookRequest,
  UpsertNotificationPreferenceRequest,
  WebhookDelivery,
  WebhookDeliveryStatus,
  WebhookEndpoint,
} from "@/types/platform/notification-api.types";

export const notificationService = {
  listPreferences: async (): Promise<NotificationPreference[]> => {
    const res = await platformApi.get<NotificationPreference[]>("/notifications/preferences");
    return res.data;
  },

  upsertPreference: async (
    body: UpsertNotificationPreferenceRequest,
  ): Promise<NotificationPreference> => {
    const res = await platformApi.post<NotificationPreference>("/notifications/preferences", body);
    return res.data;
  },

  deletePreference: async (id: string): Promise<void> => {
    await platformApi.delete(`/notifications/preferences/${id}`);
  },

  listWebhooks: async (): Promise<WebhookEndpoint[]> => {
    const res = await platformApi.get<WebhookEndpoint[]>("/notifications/webhooks");
    return res.data;
  },

  createWebhook: async (body: CreateWebhookRequest): Promise<WebhookEndpoint> => {
    const res = await platformApi.post<WebhookEndpoint>("/notifications/webhooks", body);
    return res.data;
  },

  updateWebhook: async (id: string, body: UpdateWebhookRequest): Promise<WebhookEndpoint> => {
    const res = await platformApi.patch<WebhookEndpoint>(`/notifications/webhooks/${id}`, body);
    return res.data;
  },

  deleteWebhook: async (id: string): Promise<void> => {
    await platformApi.delete(`/notifications/webhooks/${id}`);
  },

  testWebhook: async (id: string): Promise<{ message: string }> => {
    const res = await platformApi.post<{ message: string }>(
      `/notifications/webhooks/${id}/test`,
      {},
    );
    return res.data;
  },

  listDeliveries: async (status?: WebhookDeliveryStatus): Promise<WebhookDelivery[]> => {
    const res = await platformApi.get<WebhookDelivery[]>("/notifications/deliveries", {
      params: status ? { status } : undefined,
    });
    return res.data;
  },
};
