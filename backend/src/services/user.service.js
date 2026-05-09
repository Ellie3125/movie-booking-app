const mongoose = require('mongoose');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const validateObjectId = (id, resourceName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(`${resourceName} id is invalid`, 'INVALID_OBJECT_ID');
  }
};

const mapUserResponse = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const listUsers = async ({ role, status, search }) => {
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).lean().exec(),
    User.countDocuments(filter),
  ]);

  return {
    items: items.map(mapUserResponse),
    total,
  };
};

const getUserById = async (id) => {
  validateObjectId(id, 'User');
  const user = await User.findById(id).lean().exec();
  
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return mapUserResponse(user);
};

const changeRole = async (id, role) => {
  validateObjectId(id, 'User');
  const user = await User.findById(id).exec();
  
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  user.role = role;
  await user.save();

  return mapUserResponse(user.toObject());
};

const changeStatus = async (id, status) => {
  validateObjectId(id, 'User');
  const user = await User.findById(id).exec();
  
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  user.status = status;
  // Invalidate tokens if blocked
  if (status === 'blocked') {
    user.authVersion += 1;
  }
  
  await user.save();

  return mapUserResponse(user.toObject());
};

module.exports = {
  listUsers,
  getUserById,
  changeRole,
  changeStatus,
};
