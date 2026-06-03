const AUTH_REFRESH_EXCLUDED_PATHS = new Set([
  '/auth/admin/login',
  '/auth/login',
  '/auth/refresh-token',
  '/auth/register',
]);

const normalizeRequestPath = (requestUrl?: string) => {
  if (!requestUrl) {
    return '';
  }

  try {
    return new URL(requestUrl, 'http://localhost').pathname.replace(/\/+$/, '') || '/';
  } catch {
    return requestUrl.split(/[?#]/)[0]?.replace(/\/+$/, '') || requestUrl;
  }
};

export const shouldAttemptTokenRefresh = ({
  statusCode,
  requestUrl,
  hasRetried,
}: {
  statusCode?: number;
  requestUrl?: string;
  hasRetried?: boolean;
}) => {
  if (statusCode !== 401 || hasRetried) {
    return false;
  }

  return !AUTH_REFRESH_EXCLUDED_PATHS.has(normalizeRequestPath(requestUrl));
};
