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

const registerSchema = {
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
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
};
