<<<<<<< HEAD
export interface User {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | '';
  address?: string;
  country?: string;
  bio?: string;
  notificationPreferences?: {
    email: {
      bookingConfirmation: boolean;
      promotions: boolean;
      systemUpdates: boolean;
    };
    push: {
      bookingConfirmation: boolean;
      promotions: boolean;
      showReminders: boolean;
    };
  };
  preferences?: {
    language: 'vi' | 'en';
    theme: 'light' | 'dark' | 'system';
    timezone: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileUpdateInput {
  name?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | '';
  address?: string;
  country?: string;
  bio?: string;
=======
export type { User } from './user';

export interface ProfileUpdateInput {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
>>>>>>> main
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
