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

const PENDING_PAYMENT_KEY = 'beatcinema.pending-payment';

export type PendingPaymentInfo = {
  bookingId: string;
  paymentTransactionId: string;
  holdExpiresAt: string;
  showtimeId: string;
  createdAt: string;
};

export async function savePendingPayment(info: PendingPaymentInfo): Promise<void> {
  const dataStr = JSON.stringify(info);
  if (isWeb) {
    localStorage.setItem(PENDING_PAYMENT_KEY, dataStr);
    return;
  }
  await SecureStore.setItemAsync(PENDING_PAYMENT_KEY, dataStr);
}

export async function getPendingPayment(): Promise<PendingPaymentInfo | null> {
  try {
    const dataStr = isWeb
      ? localStorage.getItem(PENDING_PAYMENT_KEY)
      : await SecureStore.getItemAsync(PENDING_PAYMENT_KEY);
    return dataStr ? JSON.parse(dataStr) : null;
  } catch {
    return null;
  }
}

export async function clearPendingPayment(): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(PENDING_PAYMENT_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(PENDING_PAYMENT_KEY);
}

