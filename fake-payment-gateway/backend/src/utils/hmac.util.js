const crypto = require('crypto');
const { buildCanonicalString } = require('./canonical.util');
const ApiError = require('./apiError');

const createSignature = ({ payload, fields, secret }) => {
  if (!secret) {
    throw ApiError.internal(
      'HMAC secret is not configured',
      'HMAC_SECRET_NOT_CONFIGURED'
    );
  }

  const canonicalString = buildCanonicalString(payload, fields);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(canonicalString)
    .digest('hex');

  return {
    canonicalString,
    signature,
  };
};

const verifySignature = ({ payload, fields, secret, signature }) => {
  if (!secret || !signature || !/^[a-fA-F0-9]{64}$/.test(String(signature))) {
    return false;
  }

  const expectedSignature = createSignature({
    payload,
    fields,
    secret,
  }).signature;
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const providedBuffer = Buffer.from(String(signature), 'hex');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};

module.exports = {
  createSignature,
  verifySignature,
};
