// @mock-retained - no platform/identity endpoint exists for this data; parked intentionally.
import settingsData from "@/mock-data/settings.json";
import { SettingsData } from "@/types/settings.types";

export const settingsService = async (): Promise<SettingsData> => {
  return settingsData as unknown as SettingsData;
};
