const CREATE_SESSION_FIELDS = [
  'paymentId',
  'bookingId',
  'amount',
  'currency',
  'receiverBankCode',
  'receiverAccountNumber',
  'receiverAccountName',
  'callbackUrl',
  'returnUrl',
  'expiredAt',
];

const CALLBACK_FIELDS = [
  'paymentId',
  'bookingId',
  'paidAmount',
  'currency',
  'transactionCode',
  'status',
  'paidAt',
  'sourceAccountNo',
  'receiverAccountNo',
];

module.exports = {
  CREATE_SESSION_FIELDS,
  CALLBACK_FIELDS,
};
