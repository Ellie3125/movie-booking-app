const express = require('express');
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const env = require('../config/env');
const { createRateLimiter } = require('../middlewares/rateLimit.middleware');
const validate = require('../middlewares/validate.middleware');
const bookingValidation = require('../validations/booking.validation');
const paymentValidation = require('../validations/payment.validation');

const router = express.Router();
const paymentActionRateLimiter = createRateLimiter({
  scope: 'payment-action',
  windowMs: env.paymentRateLimitWindowMs,
  maxRequests: env.paymentRateLimitMaxRequests,
  keyStrategy: 'user-and-ip',
  message: 'Too many payment attempts. Please wait before retrying.',
  errorCode: 'PAYMENT_RATE_LIMIT_EXCEEDED',
});

router.get(
  '/bills/:bookingId',
  authMiddleware.protect,
  validate({ params: bookingValidation.bookingIdParamSchema }),
  paymentController.getBill
);

router.post(
  '/bills/:bookingId/pay',
  authMiddleware.protect,
  paymentActionRateLimiter,
  validate(paymentValidation.payBillSchema),
  paymentController.payBill
);

router.post(
  '/callback',
  validate(paymentValidation.callbackSchema),
  paymentController.paymentCallback
);

router.get('/result', paymentController.paymentResultPage);

module.exports = router;
