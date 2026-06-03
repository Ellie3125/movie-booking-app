const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const gatewayPaymentService = require('../services/gatewayPayment.service');
const { getRequestBaseUrl } = require('../utils/payment.util');
const { paymentRequests } = require('../configs/memoryDb');
const ApiError = require('../utils/apiError');

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

const listPaymentRequests = asyncHandler(async (req, res) => {
  const list = Array.from(paymentRequests.values()).map((payment) =>
    gatewayPaymentService.mapPaymentResponse(payment, getRequestBaseUrl(req))
  );

  // Sắp xếp mới nhất lên đầu
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return sendApiResponse(res, {
    message: 'Payment requests fetched successfully',
    data: list,
  });
});

const getPaymentRequest = asyncHandler(async (req, res) => {
  const payment = paymentRequests.get(req.params.paymentId);
  if (!payment) {
    throw ApiError.notFound('Payment request not found', 'PAYMENT_NOT_FOUND');
  }

  return sendApiResponse(res, {
    message: 'Payment request fetched successfully',
    data: gatewayPaymentService.mapPaymentResponse(payment, getRequestBaseUrl(req)),
  });
});

const resolvePaymentRequest = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { status, reason } = req.body;

  const action = status === 'success' ? 'SUCCESS' : 'FAILED';
  // Chọn mặc định tài khoản MB 0900000001 (có 1,500,000) để thanh toán
  const payerAccountNumber = status === 'success' ? '0900000001' : null;

  const data = await gatewayPaymentService.confirmPayment({
    paymentId,
    payerAccountNumber,
    action,
  });

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
  listPaymentRequests,
  getPaymentRequest,
  resolvePaymentRequest,
};
