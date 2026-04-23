const express = require('express');
const mockGatewayController = require('../controllers/mockGateway.controller');
const validate = require('../middlewares/validate.middleware');
const paymentValidation = require('../validations/payment.validation');

const router = express.Router();

router.get(
  '/pay',
  validate({ query: paymentValidation.gatewayQuerySchema }),
  mockGatewayController.getGatewayCheckoutPage
);

router.post(
  '/pay',
  validate(paymentValidation.gatewaySubmitSchema),
  mockGatewayController.submitGatewayPayment
);

module.exports = router;
