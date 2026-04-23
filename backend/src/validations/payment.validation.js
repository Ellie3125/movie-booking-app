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
    transactionCode: Joi.string().trim().required().label('transactionCode'),
    status: Joi.string().valid('SUCCESS').required().label('status'),
    paidAt: Joi.date().iso().required().label('paidAt'),
    sourceAccountNo: Joi.string().trim().required().label('sourceAccountNo'),
    receiverAccountNo: Joi.string().trim().required().label('receiverAccountNo'),
    signature: hmacSignatureSchema,
  }),
};

const gatewayQuerySchema = strictObject({
  paymentId: Joi.string().trim().required().label('paymentId'),
  signature: hmacSignatureSchema,
});

const gatewaySubmitSchema = {
  body: strictObject({
    paymentId: Joi.string().trim().required().label('paymentId'),
    signature: hmacSignatureSchema,
    sourceAccountId: objectId.required().label('sourceAccountId'),
  }),
};

module.exports = {
  payBillSchema,
  callbackSchema,
  gatewayQuerySchema,
  gatewaySubmitSchema,
};
