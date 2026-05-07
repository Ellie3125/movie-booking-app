import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'beatcinema.access-token',
  REFRESH_TOKEN: 'beatcinema.refresh-token',
} as const;

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
};

export async function saveTokens({ accessToken, refreshToken }: Tokens): Promise<void> {
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
  }
}

export async function saveAccessToken(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
}
