import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'beatcinema.access-token',
  REFRESH_TOKEN: 'beatcinema.refresh-token',
} as const;

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
};

const isWeb = Platform.OS === 'web';

export async function saveTokens({ accessToken, refreshToken }: Tokens): Promise<void> {
  if (isWeb) {
    localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
    }
    return;
  }
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
  }
}

export async function saveAccessToken(accessToken: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    return;
  }
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
}

export async function getAccessToken(): Promise<string | null> {
  try {
    if (isWeb) {
      return localStorage.getItem(KEYS.ACCESS_TOKEN);
    }
    return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    if (isWeb) {
      return localStorage.getItem(KEYS.REFRESH_TOKEN);
    }
    return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
    return;
  }
  await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
}
