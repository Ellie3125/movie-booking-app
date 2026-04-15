const express = require('express');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const bookingValidation = require('../validations/booking.validation');

const router = express.Router();

router.use(authMiddleware.protect);

router.get(
  '/',
  validate({ query: bookingValidation.listBookingsQuerySchema }),
  bookingController.listMyBookings
);
router.post(
  '/',
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
  validate({ params: bookingValidation.bookingIdParamSchema }),
  bookingController.cancelBooking
);

module.exports = router;
