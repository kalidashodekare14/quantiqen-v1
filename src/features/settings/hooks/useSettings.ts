"use client";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../services/settings.service";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: settingsService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
