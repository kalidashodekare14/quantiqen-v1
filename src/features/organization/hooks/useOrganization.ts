"use client";
import { useQuery } from "@tanstack/react-query";
import { organizationService } from "../services/organization.service";

export const useOrganization = () => {
  return useQuery({
    queryKey: ["organization"],
    queryFn: organizationService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
