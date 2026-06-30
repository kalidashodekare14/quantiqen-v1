export interface NotificationSettings {
  emailAlerts: boolean;
  newRiskAlerts: boolean;
  decisionUpdates: boolean;
  weeklyDigest: boolean;
  apiLimitWarnings: boolean;
}

export interface Preferences {
  language: string;
  timezone: string;
  dateFormat: string;
}

export interface SecuritySettingsData {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
}

export interface Settings {
  theme: string;
  notifications: NotificationSettings;
  preferences: Preferences;
  security: SecuritySettingsData;
}

export interface SettingsData {
  settings: Settings;
}
