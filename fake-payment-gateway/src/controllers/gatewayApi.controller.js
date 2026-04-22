const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const gatewayPaymentService = require('../services/gatewayPayment.service');
const { getRequestBaseUrl } = require('../utils/payment.util');

const createSession = asyncHandler(async (req, res) => {
  const data = await gatewayPaymentService.createPaymentSession({
    input: req.body,
    baseUrl: getRequestBaseUrl(req),
  });

  return sendApiResponse(res, {
    statusCode: 201,
    message: 'Payment session created successfully',
    data,
  });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const data = await gatewayPaymentService.confirmPayment(req.body);

  return sendApiResponse(res, {
    message: data.message,
    data: {
      payment: gatewayPaymentService.mapPaymentResponse(
        data.payment,
        getRequestBaseUrl(req)
      ),
      callback: data.callbackResult,
      redirectUrl: data.redirectUrl,
    },
  });
});

module.exports = {
  createSession,
  confirmPayment,
};
