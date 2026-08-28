import type { CustomerRole } from "@/types/auth.types";

export interface PortalProfile {
  id: string;
  userId: string;
  displayName: string | null;
  role: CustomerRole;
  status: "ACTIVE" | "SUSPENDED";
  email: string;
  phone: string;
  mustChangePassword: boolean;
  mfaEnabled: boolean;
  organizationName: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ProfileData {
  user: PortalProfile;
}

export interface UpdateProfileData {
  displayName?: string | null;
  email?: string;
  phone?: string;
}
