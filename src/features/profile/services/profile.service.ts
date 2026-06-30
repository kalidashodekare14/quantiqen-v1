import profileData from "@/mock-data/profile.json";
import { ProfileData } from "@/types/profile.types";

export const profileService = async (): Promise<ProfileData> => {
  return profileData as unknown as ProfileData;
};
