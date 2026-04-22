const crypto = require('crypto');
const env = require('../config/env');
const ApiError = require('./apiError');

const PAYMENT_HMAC_ALGORITHM = 'HMAC-SHA256';
const PAYMENT_HMAC_FIELDS = [
  'billId',
  'bookingId',
  'userId',
  'paidAmount',
  'currency',
  'issuedAt',
  'expiresAt',
];

let hasWarnedAboutFallbackSecret = false;

const getPaymentHmacSecret = () => {
  if (!env.paymentHmacSecret) {
    throw ApiError.internal(
      'Payment HMAC secret is not configured',
      'PAYMENT_HMAC_SECRET_NOT_CONFIGURED'
    );
  }

  if (
    env.paymentHmacSecretSource === 'access_or_jwt_fallback' &&
    env.nodeEnv !== 'production' &&
    !hasWarnedAboutFallbackSecret
  ) {
    hasWarnedAboutFallbackSecret = true;
    console.warn(
      '[payment-hmac] PAYMENT_HMAC_SECRET is not set. Falling back to ACCESS_TOKEN_SECRET/JWT_SECRET in non-production.'
    );
  }

  return env.paymentHmacSecret;
};

const buildPaymentRawData = (payload) =>
  PAYMENT_HMAC_FIELDS.map((field) => `${field}=${String(payload[field])}`).join('&');

const generatePaymentSignature = (payload) =>
  crypto
    .createHmac('sha256', getPaymentHmacSecret())
    .update(buildPaymentRawData(payload))
    .digest('hex');

const verifyPaymentSignature = (payload, providedSignature) => {
  const expectedSignature = generatePaymentSignature(payload);
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const providedBuffer = Buffer.from(providedSignature, 'hex');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};

module.exports = {
  PAYMENT_HMAC_ALGORITHM,
  PAYMENT_HMAC_FIELDS,
  buildPaymentRawData,
  generatePaymentSignature,
  verifyPaymentSignature,
};
