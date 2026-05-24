import api from '../api/axios';
import { ProfileUpdateInput, NotificationPrefsInput, PreferencesInput } from '../types/profile';

export const profileService = {
  updateProfile: async (data: ProfileUpdateInput) => {
    const response = await api.patch('/auth/update-profile', data);
    return response.data.data;
  },

  updateNotificationPreferences: async (data: NotificationPrefsInput) => {
    const response = await api.patch('/auth/update-notifications', data);
    return response.data.data;
  },

  updatePreferences: async (data: PreferencesInput) => {
    const response = await api.patch('/auth/update-preferences', data);
    return response.data.data;
  },

  deleteAccount: async (data: any) => {
    const response = await api.delete('/auth/delete-account', { data });
    return response.data;
  },

  uploadAvatar: async (formData: FormData) => {
    const response = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
