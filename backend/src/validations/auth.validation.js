const { Joi, strictObject } = require('./common.validation');

const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } })
  .required()
  .label('email');

const passwordSchema = Joi.string()
  .trim()
  .min(6)
  .max(128)
  .required()
  .label('password')
  .messages({
    'string.min': 'password must be at least 6 characters',
    'string.max': 'password must be at most 128 characters',
  });

const refreshTokenSchema = Joi.string()
  .trim()
  .min(20)
  .required()
  .label('refreshToken');

const rememberMeSchema = Joi.boolean().default(false).label('rememberMe');

const fullNameSchema = Joi.string().trim().min(2).max(120).required().label('fullName').messages({
  'string.min': 'fullName must be at least 2 characters',
  'string.max': 'fullName must be at most 120 characters',
});

const optionalFullNameSchema = fullNameSchema.optional();

const phoneNumberSchema = Joi.string()
  .trim()
  .allow('')
  .max(20)
  .optional()
  .label('phoneNumber');

const avatarUrlSchema = Joi.string()
  .trim()
  .allow('', null)
  .max(500)
  .optional()
  .label('avatarUrl');

const confirmPasswordSchema = Joi.string()
  .valid(Joi.ref('password'))
  .required()
  .label('confirmPassword')
  .messages({ 'any.only': 'confirmPassword must match password' });

const registerSchema = {
  body: strictObject({
    fullName: fullNameSchema,
    email: emailSchema,
    phoneNumber: phoneNumberSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    rememberMe: rememberMeSchema,
  }),
};

const createAdminSchema = {
  body: strictObject({
    fullName: fullNameSchema,
    email: emailSchema,
    phoneNumber: phoneNumberSchema,
    password: passwordSchema,
  }),
};

const loginSchema = {
  body: strictObject({
    email: emailSchema,
    password: passwordSchema,
    rememberMe: rememberMeSchema,
  }),
};

const refreshTokenRequestSchema = {
  body: strictObject({
    refreshToken: refreshTokenSchema.optional(),
  }),
};

const logoutSchema = {
  body: strictObject({
    refreshToken: refreshTokenSchema.optional(),
  }),
};

const changePasswordSchema = {
  body: strictObject({
    currentPassword: passwordSchema.label('currentPassword'),
    newPassword: passwordSchema.label('newPassword'),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .label('confirmPassword')
      .messages({ 'any.only': 'confirmPassword must match newPassword' }),
  }),
};

const updateProfileSchema = {
  body: strictObject({
    fullName: optionalFullNameSchema,
    phoneNumber: phoneNumberSchema,
    avatarUrl: avatarUrlSchema,
  }).min(1),
};

const updateNotificationPreferencesSchema = {
  body: Joi.object({
    email: Joi.object({
      bookingConfirmation: Joi.boolean(),
      promotions: Joi.boolean(),
      systemUpdates: Joi.boolean(),
    }).optional(),
    push: Joi.object({
      bookingConfirmation: Joi.boolean(),
      promotions: Joi.boolean(),
      showReminders: Joi.boolean(),
    }).optional(),
  }).required().unknown(false).min(1),
};

const updatePreferencesSchema = {
  body: Joi.object({
    language: Joi.string().valid('vi', 'en').optional(),
    theme: Joi.string().valid('light', 'dark', 'system').optional(),
    timezone: Joi.string().max(50).optional(),
    dateFormat: Joi.string().valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD').optional(),
  }).required().unknown(false).min(1),
};

const deleteAccountSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().label('currentPassword'),
    confirmation: Joi.string().valid('DELETE').required().label('confirmation'),
  }).required().unknown(false),
};

module.exports = {
  changePasswordSchema,
  createAdminSchema,
  refreshTokenRequestSchema,
  registerSchema,
  loginSchema,
  logoutSchema,
  updateProfileSchema,
  updateNotificationPreferencesSchema,
  updatePreferencesSchema,
  deleteAccountSchema,
};
