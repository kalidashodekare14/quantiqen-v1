"use client";

import { useQuery } from "@tanstack/react-query";

import { getPlatformOrganization } from "@/services/organization.service";

export const useOrganization = () => {
  return useQuery({
    queryKey: ["platform-organization"],
    queryFn: getPlatformOrganization,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
