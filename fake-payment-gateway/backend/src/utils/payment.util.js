const crypto = require('crypto');
const { URL } = require('url');

const generateTransactionCode = () =>
  `TXN-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase()}`;

const isPaymentExpired = (payment) =>
  Boolean(payment?.expiredAt) &&
  new Date(payment.expiredAt).getTime() <= Date.now();

const appendQueryParams = (baseUrl, params) => {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

const buildReturnUrl = (payment, extraParams = {}) =>
  appendQueryParams(payment.returnUrl, {
    paymentId: payment.paymentId,
    bookingId: payment.bookingId,
    status: payment.status,
    transactionCode: payment.transactionCode,
    ...extraParams,
  });

const getRequestBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const maskAccountNumber = (accountNumber = '') => {
  const value = String(accountNumber);

  if (value.length <= 4) {
    return value;
  }

  return `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
};

const buildQrContent = (payment) =>
  JSON.stringify({
    paymentId: payment.paymentId,
    bookingId: payment.bookingId,
    amount: payment.amount,
    currency: payment.currency,
    receiverBankCode: payment.receiverBankCode,
    receiverAccountNumber: payment.receiverAccountNumber,
    receiverAccountName: payment.receiverAccountName,
    expiredAt: new Date(payment.expiredAt).toISOString(),
  });

module.exports = {
  generateTransactionCode,
  isPaymentExpired,
  buildReturnUrl,
  getRequestBaseUrl,
  maskAccountNumber,
  buildQrContent,
};
