"use client";

import { useQuery } from "@tanstack/react-query";

import { userService } from "@/services/user.service";
import type { PlatformUser } from "@/types/platform/user.types";

export const useUsers = () => {
  return useQuery<PlatformUser[]>({
    queryKey: ["platform-users"],
    queryFn: userService.list,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
