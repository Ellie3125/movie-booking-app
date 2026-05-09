const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const authService = require('../services/auth.service');

const getRequestMetadata = (req) => ({
  ip: req.ip || req.socket?.remoteAddress || null,
  userAgent: req.get('user-agent') || null,
});

const setRefreshTokenCookie = (res, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body, getRequestMetadata(req));

  setRefreshTokenCookie(res, data.refreshToken);

  // Don't send refreshToken in body for security (though we might keep it for mobile apps if they don't use cookies)
  // But the request said "refreshToken should be saved in cookie" for Admin Web.
  // We can keep it in response for compatibility but Admin Web should ignore it.
  return sendApiResponse(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data,
  });
});

const createAdmin = asyncHandler(async (req, res) => {
  const data = await authService.createAdmin(req.body, req.user);

  return sendApiResponse(res, {
    statusCode: 201,
    message: 'Admin account created successfully',
    data,
  });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, getRequestMetadata(req));

  setRefreshTokenCookie(res, data.refreshToken);

  return sendApiResponse(res, {
    message: 'Login successful',
    data,
  });
});

const adminLogin = asyncHandler(async (req, res) => {
  const data = await authService.adminLogin(req.body, getRequestMetadata(req));

  setRefreshTokenCookie(res, data.refreshToken);

  return sendApiResponse(res, {
    message: 'Admin login successful',
    data,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return sendApiResponse(res, {
      statusCode: 401,
      message: 'Refresh token is required',
      errorCode: 'REFRESH_TOKEN_REQUIRED',
    });
  }

  const data = await authService.refreshAccessToken(
    { refreshToken: token },
    getRequestMetadata(req)
  );

  setRefreshTokenCookie(res, data.refreshToken);

  return sendApiResponse(res, {
    message: 'Token refreshed successfully',
    data,
  });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (token) {
    await authService.logout({ refreshToken: token }, req.user);
  }

  clearRefreshTokenCookie(res);

  return sendApiResponse(res, {
    message: 'Logout successful',
    data: { loggedOut: true },
  });
});

const logoutAllDevices = asyncHandler(async (req, res) => {
  const data = await authService.logoutAllDevices(req.user);

  return sendApiResponse(res, {
    message: 'Logged out from all devices successfully',
    data,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const data = await authService.changePassword(req.body, req.user);

  return sendApiResponse(res, {
    message: 'Password changed successfully',
    data,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await authService.updateProfile(req.body, req.user);

  return sendApiResponse(res, {
    message: 'Profile updated successfully',
    data,
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const data = await authService.getCurrentUser(req.user.id);

  return sendApiResponse(res, {
    message: 'Current user fetched successfully',
    data,
  });
});

module.exports = {
  adminLogin,
  changePassword,
  createAdmin,
  register,
  login,
  logout,
  logoutAllDevices,
  refreshToken,
  getCurrentUser,
  updateProfile,
};
