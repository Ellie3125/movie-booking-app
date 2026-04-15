const crypto = require('crypto');
const env = require('../config/env');
const ApiError = require('./apiError');

const PAYMENT_HMAC_FIELDS = [
  'bookingId',
  'userId',
  'paidAmount',
  'currency',
  'timestamp',
];

const getPaymentHmacSecret = () => {
  if (!env.paymentHmacSecret) {
    throw ApiError.internal(
      'Payment HMAC secret is not configured',
      'PAYMENT_HMAC_SECRET_NOT_CONFIGURED'
    );
  }

  return env.paymentHmacSecret;
};

const buildPaymentRawData = (payload) =>
  PAYMENT_HMAC_FIELDS.map((field) => `${field}=${payload[field]}`).join('&');

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
  PAYMENT_HMAC_FIELDS,
  buildPaymentRawData,
  generatePaymentSignature,
  verifyPaymentSignature,
};
