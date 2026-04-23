const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const paymentService = require('../services/payment.service');
const { getRequestBaseUrl } = require('../utils/url');

const getBill = asyncHandler(async (req, res) => {
  const data = await paymentService.getBill({
    bookingId: req.params.bookingId,
    userId: req.user.id,
  });

  return sendApiResponse(res, {
    message: 'Payment bill fetched successfully',
    data,
  });
});

const payBill = asyncHandler(async (req, res) => {
  const data = await paymentService.payBill({
    bookingId: req.params.bookingId,
    userId: req.user.id,
    baseUrl: getRequestBaseUrl(req),
  });

  return sendApiResponse(res, {
    message: 'Payment transaction initialized successfully',
    data,
  });
});

const paymentCallback = asyncHandler(async (req, res) => {
  const data = await paymentService.handlePaymentCallback(req.body);

  return sendApiResponse(res, {
    message: 'Payment callback processed successfully',
    data,
  });
});

const paymentResultPage = (req, res) => {
  const html = paymentService.renderPaymentResultPage({
    status: req.query.status,
    paymentId: req.query.paymentId,
    bookingId: req.query.bookingId,
    transactionCode: req.query.transactionCode,
  });

  res.status(200).type('html').send(html);
};

module.exports = {
  getBill,
  payBill,
  paymentCallback,
  paymentResultPage,
};
