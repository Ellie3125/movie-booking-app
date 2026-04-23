const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('./apiError');

const DURATION_UNITS_IN_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const getRequiredSecret = (value, code) => {
  if (!value) {
    throw ApiError.internal(
      'JWT secret is not configured',
      code || 'JWT_SECRET_NOT_CONFIGURED'
    );
  }

  return value;
};

const parseDurationToMs = (value) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value !== 'string') {
    throw ApiError.internal('Invalid token duration configuration', 'INVALID_TOKEN_DURATION');
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(\d+)([smhd])$/i);

  if (!match) {
    throw ApiError.internal('Invalid token duration configuration', 'INVALID_TOKEN_DURATION');
  }

  const [, amount, unit] = match;

  return Number(amount) * DURATION_UNITS_IN_MS[unit.toLowerCase()];
};

const getExpiryDate = (expiresIn) =>
  new Date(Date.now() + parseDurationToMs(expiresIn));

const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

const compareToken = (plainToken, hashedToken) => {
  const plainHash = Buffer.from(hashToken(plainToken), 'hex');
  const storedHash = Buffer.from(String(hashedToken || ''), 'hex');

  if (plainHash.length !== storedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(plainHash, storedHash);
};

const generateTokenId = () => crypto.randomUUID();

const signToken = (payload, secret, options = {}) => {
  const signOptions = {};

  if (options.expiresIn) {
    signOptions.expiresIn = options.expiresIn;
  }

  if (typeof options.jwtid === 'string' && options.jwtid.trim()) {
    signOptions.jwtid = options.jwtid;
  }

  if (typeof options.subject === 'string' && options.subject.trim()) {
    signOptions.subject = options.subject;
  }

  return jwt.sign(payload, secret, signOptions);
};

const generateAccessToken = (payload, options = {}) =>
  signToken(
    {
      ...payload,
      tokenType: 'access',
    },
    getRequiredSecret(
      env.accessTokenSecret,
      'ACCESS_TOKEN_SECRET_NOT_CONFIGURED'
    ),
    {
      expiresIn: options.expiresIn || env.accessTokenExpiresIn,
      subject: options.subject || payload.userId || payload.sub,
    }
  );

const generateRefreshToken = (payload, options = {}) => {
  const jwtid = options.jwtid || generateTokenId();
  const token = signToken(
    {
      ...payload,
      tokenType: 'refresh',
    },
    getRequiredSecret(
      env.refreshTokenSecret,
      'REFRESH_TOKEN_SECRET_NOT_CONFIGURED'
    ),
    {
      expiresIn: options.expiresIn || env.refreshTokenExpiresIn,
      jwtid,
      subject: options.subject || payload.userId || payload.sub,
    }
  );

  return {
    token,
    jti: jwtid,
    expiresAt: getExpiryDate(options.expiresIn || env.refreshTokenExpiresIn),
  };
};

const verifyToken = (token, secret, invalidCode, invalidMessage, tokenType) => {
  try {
    const decoded = jwt.verify(token, secret);

    if (tokenType && decoded.tokenType !== tokenType) {
      throw ApiError.unauthorized(invalidMessage, invalidCode);
    }

    return decoded;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.unauthorized(invalidMessage, invalidCode);
  }
};

const verifyAccessToken = (token) =>
  verifyToken(
    token,
    getRequiredSecret(
      env.accessTokenSecret,
      'ACCESS_TOKEN_SECRET_NOT_CONFIGURED'
    ),
    'INVALID_ACCESS_TOKEN',
    'Access token is invalid or expired',
    'access'
  );

const verifyRefreshToken = (token) =>
  verifyToken(
    token,
    getRequiredSecret(
      env.refreshTokenSecret,
      'REFRESH_TOKEN_SECRET_NOT_CONFIGURED'
    ),
    'INVALID_REFRESH_TOKEN',
    'Refresh token is invalid or expired',
    'refresh'
  );

module.exports = {
  compareToken,
  generateAccessToken,
  generateRefreshToken,
  generateTokenId,
  getExpiryDate,
  hashToken,
  parseDurationToMs,
  verifyAccessToken,
  verifyRefreshToken,
};
