export type AdminRole = 'admin' | 'staff';

export type StoredAdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type StoredAdminSession = {
  accessToken: string;
  user: StoredAdminUser;
};

const ACCESS_TOKEN_KEY = 'movie-booking.admin.access-token';
const USER_KEY = 'movie-booking.admin.user';

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const isAdminRole = (role: string | null | undefined): role is AdminRole =>
  role === 'admin' || role === 'staff';

export function getAdminAccessToken() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredAdminUser() {
  if (!canUseStorage()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as StoredAdminUser;
  } catch {
    return null;
  }
}

export function getStoredAdminSession(): StoredAdminSession | null {
  const accessToken = getAdminAccessToken();
  const user = getStoredAdminUser();

  if (!accessToken || !user) {
    return null;
  }

  return {
    accessToken,
    user,
  };
}

export function saveAdminSession(session: StoredAdminSession) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearAdminSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
