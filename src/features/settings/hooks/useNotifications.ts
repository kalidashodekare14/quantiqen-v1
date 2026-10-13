"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationService } from "../services/notification.service";
import type {
  CreateWebhookRequest,
  UpdateWebhookRequest,
  UpsertNotificationPreferenceRequest,
  WebhookDeliveryStatus,
} from "@/types/platform/notification-api.types";

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: notificationService.listPreferences,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useUpsertNotificationPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertNotificationPreferenceRequest) =>
      notificationService.upsertPreference(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });
};

export const useDeleteNotificationPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.deletePreference(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });
};

export const useWebhooks = () => {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: notificationService.listWebhooks,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

const useWebhookInvalidation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      queryClient.invalidateQueries({ queryKey: ["webhook-deliveries"] });
    },
  });
};

export const useCreateWebhook = () => {
  return useWebhookInvalidation((body: CreateWebhookRequest) =>
    notificationService.createWebhook(body),
  );
};

export const useUpdateWebhook = () => {
  return useWebhookInvalidation(({ id, body }: { id: string; body: UpdateWebhookRequest }) =>
    notificationService.updateWebhook(id, body),
  );
};

export const useDeleteWebhook = () => {
  return useWebhookInvalidation((id: string) => notificationService.deleteWebhook(id));
};

export const useTestWebhook = () => {
  return useWebhookInvalidation((id: string) => notificationService.testWebhook(id));
};

export const useWebhookDeliveries = (status?: WebhookDeliveryStatus) => {
  return useQuery({
    queryKey: ["webhook-deliveries", status],
    queryFn: () => notificationService.listDeliveries(status),
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
};
