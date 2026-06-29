"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../services/notification.service";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
