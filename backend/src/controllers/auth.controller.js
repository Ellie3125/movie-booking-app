const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);

  return sendApiResponse(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data,
  });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);

  return sendApiResponse(res, {
    message: 'Login successful',
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
  register,
  login,
  getCurrentUser,
};
