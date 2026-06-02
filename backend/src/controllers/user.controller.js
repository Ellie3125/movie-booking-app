const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const userService = require('../services/user.service');

const listUsers = asyncHandler(async (req, res) => {
  const data = await userService.listUsers({
    role: req.query.role,
    isActive: req.query.isActive,
    search: req.query.search,
  });

  return sendApiResponse(res, {
    message: 'Users fetched successfully',
    data,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const data = await userService.getUserById(req.params.id);
  
  return sendApiResponse(res, {
    message: 'User fetched successfully',
    data,
  });
});

const changeRole = asyncHandler(async (req, res) => {
  const data = await userService.changeRole(req.params.id, req.body.role);
  
  return sendApiResponse(res, {
    message: 'User role changed successfully',
    data,
  });
});

const changeStatus = asyncHandler(async (req, res) => {
  const data = await userService.changeStatus(req.params.id, req.body.isActive);
  
  return sendApiResponse(res, {
    message: 'User status changed successfully',
    data,
  });
});

module.exports = {
  listUsers,
  getUserById,
  changeRole,
  changeStatus,
};
