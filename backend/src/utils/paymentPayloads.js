const env = require('../config/env');

const getPaymentReceiverAccount = () => ({
  bankCode: env.paymentReceiverBankCode,
  bankName: env.paymentReceiverBankName,
  accountNo: env.paymentReceiverAccountNo,
  accountName: env.paymentReceiverAccountName,
});

const buildGatewayPayload = (transaction) => ({
  paymentId: String(transaction.paymentId),
  bookingId: String(transaction.bookingId),
  amount: Number(transaction.amount),
  currency: transaction.currency,
  expiredAt: new Date(transaction.expiredAt).toISOString(),
  receiverAccountNo: transaction.receiverAccount.accountNo,
  callbackUrl: transaction.callbackUrl,
  returnUrl: transaction.returnUrl,
});

const buildCallbackPayload = ({
  transaction,
  transactionCode,
  paidAt,
  sourceAccountNo,
}) => ({
  paymentId: String(transaction.paymentId),
  bookingId: String(transaction.bookingId),
  paidAmount: Number(transaction.amount),
  currency: transaction.currency,
  transactionCode: String(transactionCode),
  status: 'SUCCESS',
  paidAt: new Date(paidAt).toISOString(),
  sourceAccountNo: String(sourceAccountNo),
  receiverAccountNo: transaction.receiverAccount.accountNo,
});

const maskAccountNo = (accountNo = '') => {
  const value = String(accountNo);

  if (value.length <= 4) {
    return value;
  }

  return `${'*'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
};

module.exports = {
  getPaymentReceiverAccount,
  buildGatewayPayload,
  buildCallbackPayload,
  maskAccountNo,
};
