import type { CustomerRole } from "@/types/auth.types";

export interface PortalUser {
  id: string;
  userId: string;
  displayName: string | null;
  role: CustomerRole;
  status: "ACTIVE" | "SUSPENDED";
  email: string;
  phone: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  _actions?: unknown;
}

export interface CreateUserData {
  role: Exclude<CustomerRole, "CUSTOMER_ADMIN">;
  userId: string;
  displayName: string;
  email: string;
  phone?: string;
}

export interface UpdateUserData {
  displayName?: string | null;
  role?: Exclude<CustomerRole, "CUSTOMER_ADMIN">;
  status?: "ACTIVE" | "SUSPENDED";
  email?: string;
  phone?: string;
}

export interface CreateUserResponse {
  user: PortalUser;
  temporaryPassword: string;
  temporaryPasswordExpiresAt: string;
  delivery: string;
  emailSent: boolean;
}
