import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { User, ProfileUpdateInput, NotificationPrefsInput, PreferencesInput } from '../types/profile';
import { profileService } from '../services/profileService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateInput) => Promise<void>;
  updateNotificationPreferences: (data: NotificationPrefsInput) => Promise<void>;
  updatePreferences: (data: PreferencesInput) => Promise<void>;
  deleteAccount: (data: any) => Promise<void>;
  uploadAvatar: (formData: FormData) => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/admin/login', { email, password });
    const { user, accessToken } = response.data.data;

    setUser(user);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (data: ProfileUpdateInput) => {
    const updatedUser = await profileService.updateProfile(data);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updateNotificationPreferences = async (data: NotificationPrefsInput) => {
    const updatedUser = await profileService.updateNotificationPreferences(data);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updatePreferences = async (data: PreferencesInput) => {
    const updatedUser = await profileService.updatePreferences(data);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const deleteAccount = async (data: any) => {
    await profileService.deleteAccount(data);
    await logout();
  };

  const uploadAvatar = async (formData: FormData) => {
    const updatedUser = await profileService.uploadAvatar(formData);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const changePassword = async (data: any) => {
    await api.patch('/auth/change-password', data);
    // Success: Usually logout as password changed
    await logout();
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    updateNotificationPreferences,
    updatePreferences,
    deleteAccount,
    uploadAvatar,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
