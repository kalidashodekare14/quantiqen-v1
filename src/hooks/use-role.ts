"use client";

import { useAuth } from "@/lib/auth-context";
import { ROLE_PERMISSIONS } from "@/constants/roles";
import type { CustomerRole } from "@/types/auth.types";

export function useRole() {
  const { user } = useAuth();
  const role = (user?.role as CustomerRole) ?? null;
  const perms = role ? ROLE_PERMISSIONS[role] : null;

  return {
    role,
    isAdmin: role === "CUSTOMER_ADMIN",
    canManageUsers: perms?.usersManage ?? false,
    canRevokeSessions: perms?.sessionsRevoke ?? false,
    canEditPolicy: perms?.policyUpdate ?? false,
    canViewAudit: perms?.auditView ?? false,
    hasRole: (r: CustomerRole) => role === r,
    hasAnyRole: (roles: string[]) => role !== null && (roles as CustomerRole[]).includes(role),
  };
}
