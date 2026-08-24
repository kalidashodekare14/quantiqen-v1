"use client";

import type { CustomerRole } from "@/types/auth.types";
import { useRole } from "@/hooks/use-role";

interface RequireRoleProps {
  allowedRoles: CustomerRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ allowedRoles, children, fallback = null }: RequireRoleProps) {
  const { hasAnyRole } = useRole();
  return hasAnyRole(allowedRoles) ? <>{children}</> : <>{fallback}</>;
}
