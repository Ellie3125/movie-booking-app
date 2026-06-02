const env = require('../config/env');
const { Joi, strictObject, objectId } = require('./common.validation');
const bookingValidation = require('./booking.validation');

const hmacSignatureSchema = Joi.string()
  .trim()
  .pattern(/^[a-fA-F0-9]{64}$/)
  .required()
  .label('signature')
  .messages({
    'string.pattern.base': 'signature must be a 64-character hex string',
  });

const payBillSchema = {
  params: bookingValidation.bookingIdParamSchema,
  body: Joi.object({
    returnUrl: Joi.string().trim().max(2048).allow('').optional(),
  })
    .default({})
    .unknown(true),
};

const callbackSchema = {
  body: strictObject({
    paymentId: Joi.string().trim().required().label('paymentId'),
    bookingId: objectId.required().label('bookingId'),
    paidAmount: Joi.number()
      .integer()
      .positive()
      .required()
      .label('paidAmount'),
    currency: Joi.string()
      .valid(env.paymentCurrency)
      .required()
      .label('currency'),
    transactionCode: Joi.when('status', {
      is: 'SUCCESS',
      then: Joi.string().trim().required().label('transactionCode'),
      otherwise: Joi.string()
        .trim()
        .allow('', null)
        .optional()
        .label('transactionCode'),
    }),
    status: Joi.string()
      .valid('SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED')
      .required()
      .label('status'),
    paidAt: Joi.when('status', {
      is: 'SUCCESS',
      then: Joi.date().iso().required().label('paidAt'),
      otherwise: Joi.alternatives()
        .try(Joi.date().iso(), Joi.string().trim().allow('', null))
        .optional()
        .label('paidAt'),
    }),
    sourceAccountNo: Joi.when('status', {
      is: 'SUCCESS',
      then: Joi.string().trim().required().label('sourceAccountNo'),
      otherwise: Joi.string()
        .trim()
        .allow('', null)
        .optional()
        .label('sourceAccountNo'),
    }),
    receiverAccountNo: Joi.string().trim().required().label('receiverAccountNo'),
    signature: hmacSignatureSchema,
  }),
};

module.exports = {
  payBillSchema,
  callbackSchema,
};
