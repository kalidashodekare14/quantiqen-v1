import type { CustomerRole } from "@/types/auth.types";

export const CUSTOMER_ROLES = {
  CUSTOMER_ADMIN: "CUSTOMER_ADMIN",
  ANALYST: "ANALYST",
  AUDITOR: "AUDITOR",
  READ_ONLY: "READ_ONLY",
} as const;

export const ROLE_PERMISSIONS: Record<
  CustomerRole,
  {
    usersManage: boolean;
    sessionsRevoke: boolean;
    policyUpdate: boolean;
    auditView: boolean;
  }
> = {
  CUSTOMER_ADMIN: { usersManage: true, sessionsRevoke: true, policyUpdate: true, auditView: true },
  ANALYST: { usersManage: false, sessionsRevoke: false, policyUpdate: false, auditView: true },
  AUDITOR: { usersManage: false, sessionsRevoke: false, policyUpdate: false, auditView: true },
  READ_ONLY: { usersManage: false, sessionsRevoke: false, policyUpdate: false, auditView: false },
};
