const crypto = require('crypto');
const ApiError = require('./apiError');
const { buildCanonicalString } = require('./paymentCanonical');

const validateSecret = (secret, label) => {
  if (!secret) {
    throw ApiError.internal(
      `${label} is not configured`,
      'PAYMENT_HMAC_SECRET_NOT_CONFIGURED'
    );
  }
};

const signHmacSha256 = ({ payload, fields, secret, secretLabel = 'HMAC secret' }) => {
  validateSecret(secret, secretLabel);

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

const verifyHmacSha256 = ({
  payload,
  fields,
  secret,
  signature,
  secretLabel = 'HMAC secret',
}) => {
  if (!signature || !/^[a-fA-F0-9]{64}$/.test(String(signature))) {
    return false;
  }

  const expected = signHmacSha256({
    payload,
    fields,
    secret,
    secretLabel,
  }).signature;
  const expectedBuffer = Buffer.from(expected, 'hex');
  const providedBuffer = Buffer.from(String(signature), 'hex');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};

module.exports = {
  signHmacSha256,
  verifyHmacSha256,
};
