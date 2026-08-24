"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userManagementService } from "../services/userManagement.service";
import type { UpdateUserData } from "../types/user-management.types";

export function usePortalUsers() {
  return useQuery({
    queryKey: ["portal-users"],
    queryFn: userManagementService.list,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useCreatePortalUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userManagementService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    },
  });
}

export function useUpdatePortalUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) =>
      userManagementService.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-users"] });
    },
  });
}
