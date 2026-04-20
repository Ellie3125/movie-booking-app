const express = require('express');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const env = require('../config/env');
const { createRateLimiter } = require('../middlewares/rateLimit.middleware');
const validate = require('../middlewares/validate.middleware');
const bookingValidation = require('../validations/booking.validation');

const router = express.Router();
const bookingActionRateLimiter = createRateLimiter({
  scope: 'booking-action',
  windowMs: env.bookingRateLimitWindowMs,
  maxRequests: env.bookingRateLimitMaxRequests,
  keyStrategy: 'user-and-ip',
  message: 'Too many booking actions. Please wait a moment and try again.',
  errorCode: 'BOOKING_RATE_LIMIT_EXCEEDED',
});

router.use(authMiddleware.protect);

router.get(
  '/',
  validate({ query: bookingValidation.listBookingsQuerySchema }),
  bookingController.listMyBookings
);
router.post(
  '/',
  bookingActionRateLimiter,
  validate(bookingValidation.createBookingSchema),
  bookingController.createBooking
);
router.get(
  '/:bookingId',
  validate({ params: bookingValidation.bookingIdParamSchema }),
  bookingController.getMyBookingById
);
router.post(
  '/:bookingId/cancel',
  bookingActionRateLimiter,
  validate({ params: bookingValidation.bookingIdParamSchema }),
  bookingController.cancelBooking
);

module.exports = router;
