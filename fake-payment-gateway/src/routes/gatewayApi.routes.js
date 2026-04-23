const express = require('express');
const gatewayApiController = require('../controllers/gatewayApi.controller');
const validate = require('../middlewares/validate.middleware');
const gatewayValidation = require('../validations/gateway.validation');

const router = express.Router();

router.post(
  '/create-session',
  validate(gatewayValidation.createSessionSchema),
  gatewayApiController.createSession
);

router.post(
  '/confirm-payment',
  validate(gatewayValidation.confirmPaymentSchema),
  gatewayApiController.confirmPayment
);

module.exports = router;
