export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarInitials: string;
  phone: string;
  timezone: string;
  joinedAt: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export interface ProfileData {
  profile: Profile;
}
