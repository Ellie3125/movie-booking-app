const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const { SESSION_REVOKE_REASON } = require('../models/Session');
const ApiError = require('../utils/apiError');
const env = require('../config/env');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} = require('../utils/jwt');

const PASSWORD_SALT_ROUNDS = 10;

const sanitizeUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildTokenPayload = (user) => ({
  userId: String(user._id),
  email: user.email,
  role: user.role,
  authVersion: user.authVersion || 0,
});

const getAccessTokenExpiresIn = (user) =>
  user.role === 'admin'
    ? env.adminAccessTokenExpiresIn
    : env.accessTokenExpiresIn;

const getRefreshTokenExpiresIn = (user, rememberMe) => {
  if (user.role === 'admin') {
    return env.adminRefreshTokenExpiresIn;
  }

  return rememberMe
    ? env.rememberMeRefreshTokenExpiresIn
    : env.refreshTokenExpiresIn;
};

const buildSessionMetadata = (metadata = {}) => ({
  userAgent: metadata.userAgent || null,
  ip: metadata.ip || null,
});

const buildAuthResponse = async (user, { rememberMe = false, metadata } = {}) => {
  const payload = buildTokenPayload(user);
  const accessTokenExpiresIn = getAccessTokenExpiresIn(user);
  const refreshTokenExpiresIn = getRefreshTokenExpiresIn(user, rememberMe);
  const accessToken = generateAccessToken(payload, {
    expiresIn: accessTokenExpiresIn,
    subject: payload.userId,
  });
  const refreshTokenData = generateRefreshToken(payload, {
    expiresIn: refreshTokenExpiresIn,
    subject: payload.userId,
  });

  await Session.create({
    userId: user._id,
    jti: refreshTokenData.jti,
    tokenHash: hashToken(refreshTokenData.token),
    rememberMe,
    expiresAt: refreshTokenData.expiresAt,
    lastUsedAt: new Date(),
    ...buildSessionMetadata(metadata),
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken: refreshTokenData.token,
    tokenType: 'Bearer',
    accessTokenExpiresIn,
    refreshTokenExpiresIn,
  };
};

const assertUserCanAuthenticate = (user) => {
  if (!user) {
    throw ApiError.unauthorized(
      'Email or password is incorrect',
      'INVALID_CREDENTIALS'
    );
  }
};

const register = async ({ name, email, password, rememberMe = false }, metadata) => {
  const existingUser = await User.findOne({ email }).lean().exec();

  if (existingUser) {
    throw ApiError.conflict('Email is already in use', 'EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return buildAuthResponse(user, {
    rememberMe,
    metadata,
  });
};

const login = async ({ email, password, rememberMe = false }, metadata) => {
  const user = await User.findOne({ email }).exec();

  assertUserCanAuthenticate(user);

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized(
      'Email or password is incorrect',
      'INVALID_CREDENTIALS'
    );
  }

  return buildAuthResponse(user, {
    rememberMe,
    metadata,
  });
};

const validateSessionOwner = (decoded, currentUser) => {
  const tokenUserId = decoded.userId || decoded.sub;

  if (!currentUser || String(currentUser._id) !== String(tokenUserId)) {
    throw ApiError.forbidden(
      'You do not have permission to revoke this session',
      'SESSION_FORBIDDEN'
    );
  }

  if ((decoded.authVersion || 0) !== (currentUser.authVersion || 0)) {
    throw ApiError.unauthorized(
      'Refresh token has been invalidated. Please log in again.',
      'REFRESH_TOKEN_REVOKED'
    );
  }
};

const revokeAllUserSessions = async (userId, reason, incrementAuthVersion = false) => {
  const updates = [
    Session.updateMany(
      {
        userId,
        isRevoked: false,
      },
      {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      }
    ).exec(),
  ];

  if (incrementAuthVersion) {
    updates.push(
      User.findByIdAndUpdate(userId, {
        $inc: { authVersion: 1 },
      }).exec()
    );
  }

  await Promise.all(updates);
};

const getActiveSessionFromRefreshToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);
  const now = new Date();
  const session = await Session.findOne({
    userId: decoded.userId || decoded.sub,
    jti: decoded.jti,
    tokenHash,
  }).exec();

  if (!session) {
    throw ApiError.unauthorized(
      'Refresh token is invalid, expired, or has been revoked',
      'INVALID_REFRESH_SESSION'
    );
  }

  if (session.isRevoked) {
    await revokeAllUserSessions(
      session.userId,
      SESSION_REVOKE_REASON.SECURITY,
      true
    );

    throw ApiError.unauthorized(
      'Refresh token reuse detected. Please log in again.',
      'REFRESH_TOKEN_REUSE_DETECTED'
    );
  }

  if (session.expiresAt <= now) {
    throw ApiError.unauthorized(
      'Refresh token is invalid, expired, or has been revoked',
      'INVALID_REFRESH_SESSION'
    );
  }

  const user = await User.findById(session.userId).exec();

  if (!user) {
    throw ApiError.unauthorized(
      'Authenticated user no longer exists',
      'AUTH_USER_NOT_FOUND'
    );
  }

  validateSessionOwner(decoded, user);

  return {
    decoded,
    session,
    user,
  };
};

const revokeSession = async (sessionId, reason) => {
  await Session.findByIdAndUpdate(sessionId, {
    isRevoked: true,
    revokedAt: new Date(),
    revokedReason: reason,
  }).exec();
};

const refreshAccessToken = async ({ refreshToken }, metadata) => {
  const { session, user } = await getActiveSessionFromRefreshToken(refreshToken);

  await revokeSession(session._id, SESSION_REVOKE_REASON.ROTATED);

  return buildAuthResponse(user, {
    rememberMe: session.rememberMe,
    metadata,
  });
};

const logout = async ({ refreshToken }, currentUser) => {
  const { session } = await getActiveSessionFromRefreshToken(refreshToken);

  if (String(session.userId) !== String(currentUser.id || currentUser.userId)) {
    throw ApiError.forbidden(
      'You do not have permission to revoke this session',
      'SESSION_FORBIDDEN'
    );
  }

  await revokeSession(session._id, SESSION_REVOKE_REASON.LOGOUT);

  return {
    loggedOut: true,
  };
};

const logoutAllDevices = async (currentUser) => {
  const nextAuthVersion = (currentUser.authVersion || 0) + 1;

  await Promise.all([
    User.findByIdAndUpdate(currentUser.id || currentUser.userId, {
      authVersion: nextAuthVersion,
    }).exec(),
    revokeAllUserSessions(
      currentUser.id || currentUser.userId,
      SESSION_REVOKE_REASON.LOGOUT_ALL
    ),
  ]);

  return {
    loggedOutAllDevices: true,
  };
};

const changePassword = async (
  { currentPassword, newPassword },
  currentUser
) => {
  const user = await User.findById(currentUser.id || currentUser.userId).exec();

  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized(
      'Current password is incorrect',
      'INVALID_CURRENT_PASSWORD'
    );
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    throw ApiError.conflict(
      'New password must be different from the current password',
      'PASSWORD_NOT_CHANGED'
    );
  }

  user.password = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
  user.passwordChangedAt = new Date();
  user.authVersion = (user.authVersion || 0) + 1;
  await user.save();

  await revokeAllUserSessions(user._id, SESSION_REVOKE_REASON.PASSWORD_CHANGED);

  return {
    passwordChanged: true,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId)
    .select('_id name email role authVersion passwordChangedAt createdAt updatedAt')
    .lean()
    .exec();

  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
};

module.exports = {
  changePassword,
  getCurrentUser,
  login,
  logout,
  logoutAllDevices,
  refreshAccessToken,
  register,
};
