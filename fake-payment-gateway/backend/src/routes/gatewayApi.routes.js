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

// Endpoints phục vụ quản trị/admin UI
router.get('/payment-requests', gatewayApiController.listPaymentRequests);
router.get('/payment-requests/:paymentId', gatewayApiController.getPaymentRequest);
router.post('/payment-requests/:paymentId/resolve', gatewayApiController.resolvePaymentRequest);

// Alias cho tương thích
router.post('/payment-requests', validate(gatewayValidation.createSessionSchema), gatewayApiController.createSession);

module.exports = router;
