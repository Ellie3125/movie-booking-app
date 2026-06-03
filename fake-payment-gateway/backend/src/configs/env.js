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

module.exports = {
  port: Number(process.env.PORT || 7000),
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'VND',
  gatewayBaseUrl:
    normalizeOptionalString(process.env.GATEWAY_BASE_URL) ||
    `http://localhost:${Number(process.env.PORT || 7000)}`,
  mainAppSignatureSecret: normalizeOptionalString(
    process.env.MAIN_APP_SIGNATURE_SECRET
  ),
  callbackSignatureSecret:
    normalizeOptionalString(process.env.CALLBACK_SIGNATURE_SECRET) ||
    normalizeOptionalString(process.env.MAIN_APP_SIGNATURE_SECRET),
  callbackTimeoutMs: Number(process.env.CALLBACK_TIMEOUT_MS || 10000),
};
