"use client";

import { useQuery } from "@tanstack/react-query";

import { complianceService } from "../services/compliance.service";

export const useComplianceFrameworks = () => {
  return useQuery({
    queryKey: ["compliance-frameworks"],
    queryFn: complianceService.listFrameworks,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

export const useComplianceFramework = (id?: string) => {
  return useQuery({
    queryKey: ["compliance-framework", id],
    queryFn: () => complianceService.getFramework(id as string),
    enabled: Boolean(id),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

export const useComplianceControl = (id?: string) => {
  return useQuery({
    queryKey: ["compliance-control", id],
    queryFn: () => complianceService.getControl(id as string),
    enabled: Boolean(id),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
