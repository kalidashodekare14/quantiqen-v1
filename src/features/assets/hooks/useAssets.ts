"use client";
import { useQuery } from "@tanstack/react-query";
import { assetService } from "../services/asset.service";

export const useAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: assetService,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
