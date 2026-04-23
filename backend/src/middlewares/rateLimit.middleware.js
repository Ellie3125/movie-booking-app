const ApiError = require('../utils/apiError');

const counters = new Map();
const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS = 60;
const CLEANUP_INTERVAL_MS = 60 * 1000;
let cleanupTimer = null;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
};

const normalizeIp = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice(7);
  }

  return trimmed;
};

const getClientIp = (req) => {
  return (
    normalizeIp(req.ip) ||
    normalizeIp(req.socket?.remoteAddress) ||
    normalizeIp(req.connection?.remoteAddress) ||
    'unknown'
  );
};

const startCleanupTimer = () => {
  if (cleanupTimer) {
    return;
  }

  cleanupTimer = setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of counters.entries()) {
      if (entry.resetAt <= now) {
        counters.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  cleanupTimer.unref?.();
};

const getUserKey = (req) => {
  const userId = req.user?.userId || req.user?.id;

  return userId ? `user:${userId}` : null;
};

const getRateLimitKey = (req, { keyGenerator, keyStrategy }) => {
  if (typeof keyGenerator === 'function') {
    const customKey = keyGenerator(req);

    if (typeof customKey === 'string' && customKey.trim()) {
      return customKey.trim();
    }
  }

  const ipKey = `ip:${getClientIp(req)}`;
  const userKey = getUserKey(req);

  switch (keyStrategy) {
    case 'ip':
      return ipKey;
    case 'user':
      return userKey || ipKey;
    case 'user-and-ip':
      return userKey ? `${userKey}|${ipKey}` : ipKey;
    case 'user-or-ip':
    default:
      return userKey || ipKey;
  }
};

const setRateLimitHeaders = (res, { limit, remaining, resetAt, retryAfter }) => {
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining)));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
  res.setHeader('RateLimit-Limit', String(limit));
  res.setHeader('RateLimit-Remaining', String(Math.max(0, remaining)));
  res.setHeader(
    'RateLimit-Reset',
    String(Math.max(0, Math.ceil((resetAt - Date.now()) / 1000)))
  );

  if (retryAfter > 0) {
    res.setHeader('Retry-After', String(retryAfter));
  }
};

const cleanupExpiredEntry = (key, entry, now) => {
  if (entry.resetAt <= now) {
    counters.delete(key);
    return true;
  }

  return false;
};

const createRateLimiter = (options = {}) => {
  startCleanupTimer();

  const windowMs = toPositiveInteger(options.windowMs, DEFAULT_WINDOW_MS);
  const maxRequests = toPositiveInteger(
    options.maxRequests,
    DEFAULT_MAX_REQUESTS
  );
  const message =
    options.message || 'Too many requests. Please try again later.';
  const errorCode = options.errorCode || 'RATE_LIMIT_EXCEEDED';
  const scope = options.scope || 'global';
  const keyGenerator = options.keyGenerator;
  const keyStrategy = options.keyStrategy || 'user-or-ip';
  const skip = typeof options.skip === 'function' ? options.skip : null;

  return (req, res, next) => {
    try {
      if (skip?.(req)) {
        return next();
      }

      const now = Date.now();
      const identityKey = getRateLimitKey(req, {
        keyGenerator,
        keyStrategy,
      });
      const rateLimitKey = `${scope}:${identityKey}`;

      let entry = counters.get(rateLimitKey);

      if (!entry || cleanupExpiredEntry(rateLimitKey, entry, now)) {
        entry = {
          count: 0,
          resetAt: now + windowMs,
        };
      }

      entry.count += 1;
      counters.set(rateLimitKey, entry);

      const remaining = maxRequests - entry.count;
      const retryAfter = Math.max(
        0,
        Math.ceil((entry.resetAt - now) / 1000)
      );

      setRateLimitHeaders(res, {
        limit: maxRequests,
        remaining,
        resetAt: entry.resetAt,
        retryAfter,
      });

      if (entry.count > maxRequests) {
        return next(
          ApiError.tooManyRequests(message, errorCode, [
            {
              path: 'request',
              message: `Rate limit exceeded. Retry after ${retryAfter} seconds.`,
            },
          ])
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  createRateLimiter,
};
