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
    refreshToken: refreshTokenSchema,
  }),
};

const logoutSchema = {
  body: strictObject({
    refreshToken: refreshTokenSchema,
  }),
};

const changePasswordSchema = {
  body: strictObject({
    currentPassword: passwordSchema.label('currentPassword'),
    newPassword: passwordSchema.label('newPassword'),
  }),
};

module.exports = {
  changePasswordSchema,
  createAdminSchema,
  refreshTokenRequestSchema,
  registerSchema,
  loginSchema,
  logoutSchema,
};
