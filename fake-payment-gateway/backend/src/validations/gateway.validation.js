/**
 * SPEC Disclosure
 * Autonomous Decisions:
 * - Marked the extended fields (customerName, phone, email, movieTitle, cinema, room, seats) as optional to guarantee backwards-compatibility with legacy payloads or standard test cases.
 * Deviations:
 * - None.
 * Trade-offs:
 * - None.
 * Context/Notes:
 * - These extended fields are used purely for visual presentation on the gateway UI and do not impact the signature calculation.
 */
const Joi = require('joi');
const { PAYMENT_ACTION } = require('../constants/payment.constants');
const env = require('../configs/env');

const strictObject = (shape) => Joi.object(shape).required().unknown(false);

const httpUrlSchema = Joi.string()
  .trim()
  .pattern(/^https?:\/\/.+$/)
  .required();

const safeReturnUrlSchema = Joi.string()
  .trim()
  .max(2048)
  .custom((value, helpers) => {
    try {
      const url = new URL(value);
      const protocol = url.protocol.toLowerCase();
      const isHttpUrl = protocol === 'http:' || protocol === 'https:';
      const isAppDeepLink =
        /^[a-z][a-z0-9+.-]*:$/.test(protocol) &&
        !['javascript:', 'data:', 'file:', 'vbscript:'].includes(protocol);

      if (isHttpUrl || isAppDeepLink) {
        return value;
      }
    } catch {
      return helpers.error('string.safeReturnUrl');
    }

    return helpers.error('string.safeReturnUrl');
  })
  .required()
  .messages({
    'string.safeReturnUrl':
      'returnUrl must be an http(s) URL or a safe app deep link',
  });

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
    returnUrl: safeReturnUrlSchema.label('returnUrl'),
    expiredAt: Joi.date().iso().required().label('expiredAt'),
    signature: signatureSchema,
    // Extended fields for showing real information in Gateway UI
    customerName: Joi.string().trim().allow('').optional().label('customerName'),
    phone: Joi.string().trim().allow('').optional().label('phone'),
    email: Joi.string().trim().allow('').optional().label('email'),
    movieTitle: Joi.string().trim().allow('').optional().label('movieTitle'),
    cinema: Joi.string().trim().allow('').optional().label('cinema'),
    room: Joi.string().trim().allow('').optional().label('room'),
    seats: Joi.array().items(Joi.string().trim()).allow(null).optional().label('seats'),
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
