const express = require('express');
const gatewayPageController = require('../controllers/gatewayPage.controller');
const validate = require('../middlewares/validate.middleware');
const gatewayValidation = require('../validations/gateway.validation');

const router = express.Router();

router.get(
  '/pay/:paymentId',
  validate({ params: gatewayValidation.paymentIdParamSchema }),
  gatewayPageController.renderPaymentPage
);

router.post(
  '/pay/:paymentId/action',
  validate(gatewayValidation.pageActionSchema),
  gatewayPageController.handlePaymentAction
);

module.exports = router;
