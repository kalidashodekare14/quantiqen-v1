export type PlatformRole = "CUSTOMER_ADMIN" | "ANALYST" | "AUDITOR" | "READ_ONLY";

export interface PlatformUser {
  id: string;
  qipUserId: string;
  role: PlatformRole;
  email: string | null;
  name: string | null;
  createdAt: string;
}
