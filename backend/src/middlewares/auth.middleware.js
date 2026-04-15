const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { verifyAccessToken } = require('../utils/jwt');

const extractBearerToken = (authorizationHeader = '') => {
  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const getUserIdFromTokenPayload = (payload = {}) =>
  payload.userId || payload.id || payload.sub || null;

const protect = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw ApiError.unauthorized(
        'Authorization token is required',
        'AUTH_TOKEN_REQUIRED'
      );
    }

    const decoded = verifyAccessToken(token);
    const userId = getUserIdFromTokenPayload(decoded);

    if (!userId) {
      throw ApiError.unauthorized(
        'Authorization token payload is invalid',
        'INVALID_AUTH_TOKEN'
      );
    }

    const user = await User.findById(userId)
      .select('_id name email role')
      .lean()
      .exec();

    if (!user) {
      throw ApiError.unauthorized(
        'Authenticated user no longer exists',
        'AUTH_USER_NOT_FOUND'
      );
    }

    req.user = {
      id: String(user._id),
      userId: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(
      ApiError.unauthorized(
        'Authentication is required before checking permissions',
        'AUTH_REQUIRED'
      )
    );
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(
      ApiError.forbidden(
        'You do not have permission to access this resource',
        'FORBIDDEN'
      )
    );
  }

  return next();
};

module.exports = {
  protect,
  authorizeRoles,
};
