require('dotenv').config();

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
};

const parseTrustProxy = (value) => {
  if (value === undefined || value === null || value === '') {
    return false;
  }

  const normalized = String(value).trim().toLowerCase();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  const parsedNumber = Number(normalized);

  if (Number.isInteger(parsedNumber) && parsedNumber >= 0) {
    return parsedNumber;
  }

  return value;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const configuredPaymentHmacSecret = normalizeOptionalString(
  process.env.PAYMENT_HMAC_SECRET
);
const fallbackPaymentHmacSecret =
  nodeEnv !== 'production'
    ? normalizeOptionalString(
        process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET
      )
    : '';

const paymentHmacSecret = configuredPaymentHmacSecret || fallbackPaymentHmacSecret;
const paymentHmacSecretSource = configuredPaymentHmacSecret
  ? 'payment_hmac_secret'
  : fallbackPaymentHmacSecret
    ? 'access_or_jwt_fallback'
    : 'missing';
const paymentGatewaySecret = normalizeOptionalString(
  process.env.PAYMENT_GATEWAY_SECRET
) || paymentHmacSecret;
const paymentCallbackSecret = normalizeOptionalString(
  process.env.PAYMENT_CALLBACK_SECRET
) || paymentHmacSecret;

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  accessTokenSecret:
    process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  adminAccessTokenExpiresIn:
    process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN || '10m',
  refreshTokenSecret:
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  rememberMeRefreshTokenExpiresIn:
    process.env.REMEMBER_ME_REFRESH_TOKEN_EXPIRES_IN || '30d',
  adminRefreshTokenExpiresIn:
    process.env.ADMIN_REFRESH_TOKEN_EXPIRES_IN || '3d',
  bookingHoldTtlMinutes: Number(process.env.BOOKING_HOLD_TTL_MINUTES || 5),
  paymentHmacSecret,
  paymentHmacSecretSource,
  paymentGatewaySecret,
  paymentCallbackSecret,
  paymentCurrency: process.env.PAYMENT_CURRENCY || 'VND',
  paymentSignatureTtlSeconds: Number(
    process.env.PAYMENT_SIGNATURE_TTL_SECONDS || 900
  ),
  paymentReceiverBankCode:
    normalizeOptionalString(process.env.PAYMENT_RECEIVER_BANK_CODE) || 'VCB',
  paymentReceiverBankName:
    normalizeOptionalString(process.env.PAYMENT_RECEIVER_BANK_NAME) ||
    'Vietcombank',
  paymentReceiverAccountNo:
    normalizeOptionalString(process.env.PAYMENT_RECEIVER_ACCOUNT_NO) ||
    '1900100009999',
  paymentReceiverAccountName:
    normalizeOptionalString(process.env.PAYMENT_RECEIVER_ACCOUNT_NAME) ||
    'BEAT CINEMA RECEIVER',
  paymentAppReturnUrl:
    normalizeOptionalString(process.env.PAYMENT_APP_RETURN_URL) || '',
  nodeEnv,
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 600),
  authRateLimitWindowMs: Number(
    process.env.AUTH_RATE_LIMIT_WINDOW_MS || 60000
  ),
  authRateLimitMaxRequests: Number(
    process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || 60
  ),
  bookingRateLimitWindowMs: Number(
    process.env.BOOKING_RATE_LIMIT_WINDOW_MS || 60000
  ),
  bookingRateLimitMaxRequests: Number(
    process.env.BOOKING_RATE_LIMIT_MAX_REQUESTS || 50
  ),
  paymentRateLimitWindowMs: Number(
    process.env.PAYMENT_RATE_LIMIT_WINDOW_MS || 60000
  ),
  paymentRateLimitMaxRequests: Number(
    process.env.PAYMENT_RATE_LIMIT_MAX_REQUESTS || 40
  )
};
