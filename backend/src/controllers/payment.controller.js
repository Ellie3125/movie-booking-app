const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const paymentService = require('../services/payment.service');

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
    paymentMethod: req.body.paymentMethod,
    paidAmount: req.body.paidAmount,
    currency: req.body.currency,
    timestamp: req.body.timestamp,
    signature: req.body.signature,
  });

  return sendApiResponse(res, {
    message: 'Payment processed successfully',
    data,
  });
});

module.exports = {
  getBill,
  payBill,
};
