const env = require('../config/env');

const getPaymentReceiverAccount = () => ({
  bankCode: env.paymentReceiverBankCode,
  bankName: env.paymentReceiverBankName,
  accountNo: env.paymentReceiverAccountNo,
  accountName: env.paymentReceiverAccountName,
});

const buildGatewayCreateSessionPayload = (transaction) => ({
  paymentId: String(transaction.paymentId),
  bookingId: String(transaction.bookingId),
  amount: Number(transaction.amount),
  currency: transaction.currency,
  receiverBankCode: transaction.receiverAccount.bankCode,
  receiverAccountNumber: transaction.receiverAccount.accountNo,
  receiverAccountName: transaction.receiverAccount.accountName,
  callbackUrl: transaction.callbackUrl,
  returnUrl: transaction.returnUrl,
  expiredAt: new Date(transaction.expiredAt).toISOString(),
});

module.exports = {
  getPaymentReceiverAccount,
  buildGatewayCreateSessionPayload,
};
