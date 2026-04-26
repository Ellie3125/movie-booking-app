import axios from 'axios';

import { getAdminAccessToken } from '../utils/auth';

type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiErrorResponse = {
  success: false;
  message: string;
  error?: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
};

export type AdminAuthResponse = {
  user: AdminUser;
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  accessTokenExpiresIn?: string;
  refreshTokenExpiresIn?: string;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const accessToken = getAdminAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export async function loginAdmin(payload: { email: string; password: string }) {
  const response = await api.post<ApiSuccessResponse<AdminAuthResponse>>(
    '/auth/admin/login',
    payload,
  );

  return response.data.data;
}

export async function fetchCurrentAdminUser() {
  const response = await api.get<ApiSuccessResponse<AdminUser>>('/auth/me');

  return response.data.data;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default api;
