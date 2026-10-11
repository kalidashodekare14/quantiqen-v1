"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationService } from "../services/notification.service";
import type { NotificationInboxParams } from "@/types/platform/notification-api.types";

export const useNotificationList = (params: NotificationInboxParams = {}) => {
  return useQuery({
    queryKey: ["notifications", "list", params],
    queryFn: () => notificationService.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationService.unreadCount,
    staleTime: 15000,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
};
