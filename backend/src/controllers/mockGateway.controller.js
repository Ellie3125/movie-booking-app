const mockGatewayService = require('../services/mockGateway.service');

const getGatewayCheckoutPage = async (req, res) => {
  try {
    const data = await mockGatewayService.loadGatewayCheckout({
      paymentId: req.query.paymentId,
      signature: req.query.signature,
    });
    const html = mockGatewayService.renderGatewayCheckoutPage(data);

    res.status(200).type('html').send(html);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .type('html')
      .send(mockGatewayService.renderGatewayErrorPage(error));
  }
};

const submitGatewayPayment = async (req, res) => {
  try {
    const redirectUrl = await mockGatewayService.submitGatewayPayment({
      paymentId: req.body.paymentId,
      signature: req.body.signature,
      sourceAccountId: req.body.sourceAccountId,
    });

    res.redirect(302, redirectUrl);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .type('html')
      .send(mockGatewayService.renderGatewayErrorPage(error));
  }
};

module.exports = {
  getGatewayCheckoutPage,
  submitGatewayPayment,
};
