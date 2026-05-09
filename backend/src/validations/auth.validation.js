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

const registerSchema = {
  body: strictObject({
    name: Joi.string().trim().min(2).max(120).required().label('name').messages({
      'string.min': 'name must be at least 2 characters',
      'string.max': 'name must be at most 120 characters',
    }),
    email: emailSchema,
    password: passwordSchema,
    rememberMe: rememberMeSchema,
  }),
};

const createAdminSchema = {
  body: strictObject({
    name: Joi.string().trim().min(2).max(120).required().label('name').messages({
      'string.min': 'name must be at least 2 characters',
      'string.max': 'name must be at most 120 characters',
    }),
    email: emailSchema,
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
    name: Joi.string().trim().min(2).max(120).optional().label('name'),
    avatar: Joi.string()
      .trim()
      .pattern(/^\/avatars\/.+/)
      .optional()
      .label('avatar')
      .messages({
        'string.pattern.base': 'avatar must start with /avatars/',
      }),
  }).min(1), // At least one field must be provided
};

module.exports = {
  changePasswordSchema,
  createAdminSchema,
  refreshTokenRequestSchema,
  registerSchema,
  loginSchema,
  logoutSchema,
  updateProfileSchema,
};
