"use client";

import type { CustomerRole } from "@/types/auth.types";
import { useRole } from "@/hooks/use-role";
import { AccessDenied } from "@/components/shared/AccessDenied";

interface RequireRoleProps {
  allowedRoles: CustomerRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ allowedRoles, children, fallback }: RequireRoleProps) {
  const { hasAnyRole } = useRole();
  return hasAnyRole(allowedRoles) ? (
    <>{children}</>
  ) : (
    <>{fallback ?? <AccessDenied />}</>
  );
}
