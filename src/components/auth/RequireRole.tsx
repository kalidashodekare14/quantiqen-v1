"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import type { CustomerRole } from "@/types/auth.types";
import { useRole } from "@/hooks/use-role";

interface RequireRoleProps {
  allowedRoles: CustomerRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirect?: string;
}

export function RequireRole({
  allowedRoles,
  children,
  fallback = null,
  redirect,
}: RequireRoleProps) {
  const { hasAnyRole } = useRole();
  const router = useRouter();
  const allowed = hasAnyRole(allowedRoles);

  useEffect(() => {
    if (!allowed && redirect) {
      router.replace(redirect);
    }
  }, [allowed, redirect, router]);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
