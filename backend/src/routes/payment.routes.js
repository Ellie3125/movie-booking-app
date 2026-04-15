const express = require('express');
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const bookingValidation = require('../validations/booking.validation');
const paymentValidation = require('../validations/payment.validation');

const router = express.Router();

router.get(
  '/bills/:bookingId',
  authMiddleware.protect,
  validate({ params: bookingValidation.bookingIdParamSchema }),
  paymentController.getBill
);

router.post(
  '/bills/:bookingId/pay',
  authMiddleware.protect,
  validate(paymentValidation.payBillSchema),
  paymentController.payBill
);

module.exports = router;
