const Joi = require('joi');
const { PAYMENT_ACTION } = require('../constants/payment.constants');
const env = require('../configs/env');

const strictObject = (shape) => Joi.object(shape).required().unknown(false);

const httpUrlSchema = Joi.string()
  .trim()
  .pattern(/^https?:\/\/.+$/)
  .required();

const paymentIdParamSchema = strictObject({
  paymentId: Joi.string().trim().required().label('paymentId'),
});

const signatureSchema = Joi.string()
  .trim()
  .pattern(/^[a-fA-F0-9]{64}$/)
  .required()
  .label('signature')
  .messages({
    'string.pattern.base': 'signature must be a 64-character hex string',
  });

const createSessionSchema = {
  body: strictObject({
    paymentId: Joi.string().trim().required().label('paymentId'),
    bookingId: Joi.string().trim().required().label('bookingId'),
    amount: Joi.number()
      .integer()
      .positive()
      .required()
      .label('amount'),
    currency: Joi.string()
      .trim()
      .uppercase()
      .valid(env.defaultCurrency)
      .required()
      .label('currency'),
    receiverBankCode: Joi.string()
      .trim()
      .uppercase()
      .required()
      .label('receiverBankCode'),
    receiverAccountNumber: Joi.string()
      .trim()
      .required()
      .label('receiverAccountNumber'),
    receiverAccountName: Joi.string()
      .trim()
      .required()
      .label('receiverAccountName'),
    callbackUrl: httpUrlSchema.label('callbackUrl'),
    returnUrl: httpUrlSchema.label('returnUrl'),
    expiredAt: Joi.date().iso().required().label('expiredAt'),
    signature: signatureSchema,
  }),
};

const confirmPaymentBodySchema = strictObject({
  paymentId: Joi.string().trim().required().label('paymentId'),
  payerAccountNumber: Joi.when('action', {
    is: PAYMENT_ACTION.SUCCESS,
    then: Joi.string().trim().required().label('payerAccountNumber'),
    otherwise: Joi.string().trim().allow('', null).optional().label('payerAccountNumber'),
  }),
  action: Joi.string()
    .valid(...Object.values(PAYMENT_ACTION))
    .required()
    .label('action'),
});

const confirmPaymentSchema = {
  body: confirmPaymentBodySchema,
};

const pageActionSchema = {
  params: paymentIdParamSchema,
  body: strictObject({
    payerAccountNumber: Joi.when('action', {
      is: PAYMENT_ACTION.SUCCESS,
      then: Joi.string().trim().required().label('payerAccountNumber'),
      otherwise: Joi.string().trim().allow('', null).optional().label('payerAccountNumber'),
    }),
    action: Joi.string()
      .valid(...Object.values(PAYMENT_ACTION))
      .required()
      .label('action'),
  }),
};

module.exports = {
  paymentIdParamSchema,
  createSessionSchema,
  confirmPaymentSchema,
  pageActionSchema,
};
