const getUserId = (user) => {
  const id = user?._id || user?.id || user?.userId;
  return id ? String(id) : '';
};

const normalizeNullableString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const normalized = String(value).trim();
  return normalized || null;
};

const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: getUserId(user),
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    avatarUrl: user.avatarUrl || null,
    role: user.role,
    isActive: user.isActive !== false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const sanitizeUserSummary = (user) => {
  if (!user) return null;

  return {
    id: getUserId(user),
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    avatarUrl: user.avatarUrl || null,
    role: user.role,
  };
};

const normalizeProfileUpdate = (data = {}) => {
  const update = {};

  if (data.fullName !== undefined) {
    update.fullName = String(data.fullName).trim();
  }

  if (data.phoneNumber !== undefined) {
    update.phoneNumber = normalizeNullableString(data.phoneNumber) || '';
  }

  if (data.avatarUrl !== undefined) {
    update.avatarUrl = normalizeNullableString(data.avatarUrl);
  }

  return update;
};

module.exports = {
  normalizeProfileUpdate,
  sanitizeUser,
  sanitizeUserSummary,
};
