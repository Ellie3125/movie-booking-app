const asyncHandler = require('../utils/asyncHandler');
const gatewayPaymentService = require('../services/gatewayPayment.service');

const renderPaymentPage = asyncHandler(async (req, res) => {
  const data = await gatewayPaymentService.getPaymentPageData(req.params.paymentId);

  return res.render('payment', {
    title: `Payment ${data.payment.paymentId}`,
    payment: data.paymentView,
    paymentDoc: data.payment,
    qrCodeDataUrl: data.qrCodeDataUrl,
    mockAccounts: data.mockAccounts,
    remainingMs: data.remainingMs,
  });
});

const handlePaymentAction = asyncHandler(async (req, res) => {
  const data = await gatewayPaymentService.confirmPayment({
    paymentId: req.params.paymentId,
    payerAccountNumber: req.body.payerAccountNumber,
    action: req.body.action,
  });

  return res.redirect(302, data.redirectUrl);
});

module.exports = {
  renderPaymentPage,
  handlePaymentAction,
};
