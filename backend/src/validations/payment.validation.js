const Booking = require('../models/Booking');
const env = require('../config/env');
const { Joi, strictObject } = require('./common.validation');
const bookingValidation = require('./booking.validation');

const paymentMethodValues = Booking.schema
  .path('paymentMethod')
  .enumValues.filter(Boolean);

const payBillSchema = {
  params: bookingValidation.bookingIdParamSchema,
  body: strictObject({
    paymentMethod: Joi.string()
      .valid(...paymentMethodValues)
      .required()
      .label('paymentMethod'),
    paidAmount: Joi.number()
      .integer()
      .positive()
      .required()
      .label('paidAmount')
      .messages({
        'number.base': 'paidAmount must be a number',
        'number.integer': 'paidAmount must be an integer',
        'number.positive': 'paidAmount must be greater than 0',
      }),
    currency: Joi.string()
      .valid(env.paymentCurrency)
      .default(env.paymentCurrency)
      .label('currency'),
    timestamp: Joi.number()
      .integer()
      .positive()
      .required()
      .label('timestamp')
      .messages({
        'number.base': 'timestamp must be a number',
        'number.integer': 'timestamp must be an integer',
        'number.positive': 'timestamp must be greater than 0',
      }),
    signature: Joi.string()
      .trim()
      .pattern(/^[a-fA-F0-9]{64}$/)
      .required()
      .label('signature')
      .messages({
        'string.pattern.base': 'signature must be a 64-character hex string',
      }),
  }),
};

module.exports = {
  payBillSchema,
};
