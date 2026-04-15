const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { generateAccessToken } = require('../utils/jwt');

const sanitizeUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildAuthPayload = (user) => ({
  userId: String(user._id),
  email: user.email,
  role: user.role,
});

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email }).lean().exec();

  if (existingUser) {
    throw ApiError.conflict('Email is already in use', 'EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    user: sanitizeUser(user),
    accessToken: generateAccessToken(buildAuthPayload(user)),
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).exec();

  if (!user) {
    throw ApiError.unauthorized('Email or password is incorrect', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Email or password is incorrect', 'INVALID_CREDENTIALS');
  }

  return {
    user: sanitizeUser(user),
    accessToken: generateAccessToken(buildAuthPayload(user)),
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId)
    .select('_id name email role createdAt updatedAt')
    .lean()
    .exec();

  if (!user) {
    throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
