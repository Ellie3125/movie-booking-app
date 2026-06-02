const mongoose = require('mongoose');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { sanitizeUser } = require('../utils/userProfile');

const validateObjectId = (id, resourceName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(`${resourceName} id is invalid`, 'INVALID_OBJECT_ID');
  }
};

const mapUserResponse = (user) => sanitizeUser(user);

const listUsers = async ({ role, isActive, search }) => {
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
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

const changeStatus = async (id, isActive) => {
  validateObjectId(id, 'User');
  const user = await User.findById(id).exec();
  
  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  user.isActive = isActive;

  await user.save();

  return mapUserResponse(user.toObject());
};

module.exports = {
  listUsers,
  getUserById,
  changeRole,
  changeStatus,
};
