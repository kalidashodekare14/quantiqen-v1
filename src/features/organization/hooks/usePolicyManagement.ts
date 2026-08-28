"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { policyManagementService } from "../services/policyManagement.service";

export function usePortalPolicy() {
  return useQuery({
    queryKey: ["portal-policy"],
    queryFn: policyManagementService.get,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdatePortalPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: policyManagementService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-policy"] });
    },
  });
}
