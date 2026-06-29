"use client";
import { useQuery } from "@tanstack/react-query";
import { apiManagementService } from "../services/apiManagement.service";

export const useApiManagement = () => {
  return useQuery({
    queryKey: ["api-management"],
    queryFn: apiManagementService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
