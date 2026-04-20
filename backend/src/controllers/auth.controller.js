const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const authService = require('../services/auth.service');

const getRequestMetadata = (req) => ({
  ip: req.ip || req.socket?.remoteAddress || null,
  userAgent: req.get('user-agent') || null,
});

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body, getRequestMetadata(req));

  return sendApiResponse(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data,
  });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, getRequestMetadata(req));

  return sendApiResponse(res, {
    message: 'Login successful',
    data,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const data = await authService.refreshAccessToken(
    req.body,
    getRequestMetadata(req)
  );

  return sendApiResponse(res, {
    message: 'Token refreshed successfully',
    data,
  });
});

const logout = asyncHandler(async (req, res) => {
  const data = await authService.logout(req.body, req.user);

  return sendApiResponse(res, {
    message: 'Logout successful',
    data,
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

const getCurrentUser = asyncHandler(async (req, res) => {
  const data = await authService.getCurrentUser(req.user.id);

  return sendApiResponse(res, {
    message: 'Current user fetched successfully',
    data,
  });
});

module.exports = {
  changePassword,
  register,
  login,
  logout,
  logoutAllDevices,
  refreshToken,
  getCurrentUser,
};
