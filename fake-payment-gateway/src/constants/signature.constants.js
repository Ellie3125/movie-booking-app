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
  'status',
  'paidAmount',
  'currency',
  'transactionCode',
  'payerAccountNumber',
  'paidAt',
];

module.exports = {
  CREATE_SESSION_FIELDS,
  CALLBACK_FIELDS,
};
