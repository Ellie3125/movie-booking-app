const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('./apiError');

const getJwtSecret = () => {
  if (!env.jwtSecret) {
    throw ApiError.internal(
      'JWT secret is not configured',
      'JWT_SECRET_NOT_CONFIGURED'
    );
  }

  return env.jwtSecret;
};

const generateAccessToken = (payload, options = {}) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: options.expiresIn || '7d',
  });

const verifyAccessToken = (token) => {
  const jwtSecret = getJwtSecret();

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw ApiError.unauthorized(
      'Authorization token is invalid or expired',
      'INVALID_AUTH_TOKEN'
    );
  }
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};
