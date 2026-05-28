export type { User } from './user';

export interface ProfileUpdateInput {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
}

export interface NotificationPrefsInput {
  email?: {
    bookingConfirmation?: boolean;
    promotions?: boolean;
    systemUpdates?: boolean;
  };
  push?: {
    bookingConfirmation?: boolean;
    promotions?: boolean;
    showReminders?: boolean;
  };
}

export interface PreferencesInput {
  language?: 'vi' | 'en';
  theme?: 'light' | 'dark' | 'system';
  timezone?: string;
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
}
