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
    let pathname = new URL(requestUrl, 'http://localhost').pathname;
    pathname = pathname.replace(/^\/api\/v1/, '');
    return pathname.replace(/\/+$/, '') || '/';
  } catch {
    let pathname = requestUrl.split(/[?#]/)[0] || requestUrl;
    pathname = pathname.replace(/^\/api\/v1/, '');
    return pathname.replace(/\/+$/, '') || pathname;
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
