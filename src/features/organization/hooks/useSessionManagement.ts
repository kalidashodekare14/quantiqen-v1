"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionManagementService } from "../services/sessionManagement.service";

export function usePortalSessions() {
  return useQuery({
    queryKey: ["portal-sessions"],
    queryFn: sessionManagementService.list,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sessionManagementService.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-sessions"] });
    },
  });
}
