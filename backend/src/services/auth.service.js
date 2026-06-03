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
const {
  normalizeProfileUpdate,
  sanitizeUser,
} = require('../utils/userProfile');

const PASSWORD_SALT_ROUNDS = 10;
const ADMIN_PORTAL_ROLES = ['admin'];
const ADMIN_ACCOUNT_LOGIN_MESSAGE =
  'Tài khoản quản trị vui lòng đăng nhập tại trang admin';
const ADMIN_LOGIN_FORBIDDEN_MESSAGE =
  'Bạn không có quyền truy cập trang quản trị';

const isAdminPortalRole = (role) => ADMIN_PORTAL_ROLES.includes(role);

const buildTokenPayload = (user) => ({
  userId: String(user._id),
  email: user.email,
  role: user.role,
});

const getAccessTokenExpiresIn = (user) =>
  isAdminPortalRole(user.role)
    ? env.adminAccessTokenExpiresIn
    : env.accessTokenExpiresIn;

const getRefreshTokenExpiresIn = (user, rememberMe) => {
  if (isAdminPortalRole(user.role)) {
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
  if (user.isActive === false) {
    throw ApiError.forbidden(
      'Tài khoản của bạn đã bị khóa',
      'ACCOUNT_INACTIVE'
    );
  }
};

const createUserAccount = async ({ fullName, email, phoneNumber, password, role = 'user' }) => {
  const existingUser = await User.findOne({ email }).lean().exec();

  if (existingUser) {
    throw ApiError.conflict('Email is already in use', 'EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  return User.create({
    fullName,
    email,
    phoneNumber: phoneNumber || '',
    avatarUrl: null,
    passwordHash: hashedPassword,
    role,
    isActive: true,
  });
};

const register = async ({ fullName, email, phoneNumber, password, rememberMe = false }, metadata) => {
  const user = await createUserAccount({
    fullName,
    email,
    phoneNumber,
    password,
    role: 'user',
  });

  return buildAuthResponse(user, {
    rememberMe,
    metadata,
  });
};

const createAdmin = async ({ fullName, email, phoneNumber, password }, currentUser) => {
  if (currentUser?.role !== 'admin') {
    throw ApiError.forbidden(
      'Only admins can create another admin account',
      'ADMIN_REQUIRED'
    );
  }

  const user = await createUserAccount({
    fullName,
    email,
    phoneNumber,
    password,
    role: 'admin',
  });

  return sanitizeUser(user);
};

const login = async ({ email, password, rememberMe = false }, metadata) => {
  const user = await authenticateWithPassword({ email, password });

  if (user.role !== 'user') {
    throw ApiError.forbidden(
      ADMIN_ACCOUNT_LOGIN_MESSAGE,
      'ADMIN_LOGIN_REQUIRED'
    );
  }

  return buildAuthResponse(user, {
    rememberMe,
    metadata,
  });
};

const adminLogin = async ({ email, password, rememberMe = false }, metadata) => {
  const user = await authenticateWithPassword({ email, password });

  if (!isAdminPortalRole(user.role)) {
    throw ApiError.forbidden(
      ADMIN_LOGIN_FORBIDDEN_MESSAGE,
      'ADMIN_ACCESS_FORBIDDEN'
    );
  }

  return buildAuthResponse(user, {
    rememberMe,
    metadata,
  });
};

const authenticateWithPassword = async ({ email, password }) => {
  const user = await User.findOne({ email })
    .select('+passwordHash')
    .exec();

  assertUserCanAuthenticate(user);

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw ApiError.unauthorized(
      'Email or password is incorrect',
      'INVALID_CREDENTIALS'
    );
  }

  return user;
};

const validateSessionOwner = (decoded, currentUser) => {
  const tokenUserId = decoded.userId || decoded.sub;

  if (!currentUser || String(currentUser._id) !== String(tokenUserId)) {
    throw ApiError.forbidden(
      'You do not have permission to revoke this session',
      'SESSION_FORBIDDEN'
    );
  }

};

const revokeAllUserSessions = async (userId, reason) =>
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
  ).exec();

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
      SESSION_REVOKE_REASON.SECURITY
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

  if (user.isActive === false) {
    throw ApiError.unauthorized(
      'Tài khoản đã bị khoá hoặc đã bị xóa',
      'ACCOUNT_INACTIVE'
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
  await revokeAllUserSessions(
    currentUser.id || currentUser.userId,
    SESSION_REVOKE_REASON.LOGOUT_ALL
  );

  return {
    loggedOutAllDevices: true,
  };
};

const changePassword = async (
  { currentPassword, newPassword },
  currentUser
) => {
  const user = await User.findById(currentUser.id || currentUser.userId)
    .select('+passwordHash')
    .exec();

  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    throw ApiError.unauthorized(
      'Current password is incorrect',
      'INVALID_CURRENT_PASSWORD'
    );
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

  if (isSamePassword) {
    throw ApiError.conflict(
      'New password must be different from the current password',
      'PASSWORD_NOT_CHANGED'
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
  user.passwordHash = hashedPassword;
  await user.save();

  await revokeAllUserSessions(user._id, SESSION_REVOKE_REASON.PASSWORD_CHANGED);

  return {
    passwordChanged: true,
  };
};

const updateProfile = async (updateData, currentUser) => {
  const user = await User.findById(currentUser.id || currentUser.userId).exec();

  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  const normalizedUpdate = normalizeProfileUpdate(updateData);

  Object.entries(normalizedUpdate).forEach(([field, value]) => {
    user[field] = value;
  });

  await user.save();

  return sanitizeUser(user);
};

const updateNotificationPreferences = async (notificationPrefs, currentUser) => {
  const user = await User.findById(currentUser.id || currentUser.userId).exec();
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
};

const updatePreferences = async (preferencesData, currentUser) => {
  const user = await User.findById(currentUser.id || currentUser.userId).exec();
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
};

const deleteAccount = async ({ currentPassword, confirmation }, currentUser) => {
  const user = await User.findById(currentUser.id || currentUser.userId)
    .select('+passwordHash')
    .exec();
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Mật khẩu không chính xác', 'INVALID_PASSWORD');
  }

  if (confirmation !== 'DELETE') {
    throw ApiError.badRequest('Chuỗi xác nhận không hợp lệ', 'INVALID_CONFIRMATION');
  }

  user.isActive = false;

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  user.fullName = `Deleted User ${randomSuffix}`;
  user.email = `deleted_${user._id}_${randomSuffix}@beatcinema.local`;
  user.phoneNumber = '';
  user.avatarUrl = null;

  await user.save();
  await revokeAllUserSessions(user._id, SESSION_REVOKE_REASON.LOGOUT_ALL);

  return {
    deleted: true,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId)
    .select('_id fullName email phoneNumber role isActive avatarUrl createdAt updatedAt')
    .lean()
    .exec();

  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
};

module.exports = {
  adminLogin,
  changePassword,
  createAdmin,
  getCurrentUser,
  login,
  logout,
  logoutAllDevices,
  refreshAccessToken,
  register,
  updateProfile,
  updateNotificationPreferences,
  updatePreferences,
  deleteAccount,
  _private: {
    sanitizeUser,
  },
};
