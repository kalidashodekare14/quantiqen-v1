import settingsData from "@/mock-data/settings.json";
import { SettingsData } from "@/types/settings.types";

export const settingsService = async (): Promise<SettingsData> => {
  return settingsData as unknown as SettingsData;
};
