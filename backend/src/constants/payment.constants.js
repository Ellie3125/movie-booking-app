const BOOKING_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
};

const PAYMENT_METHOD = {
  MOMO_SANDBOX: 'MOMO_SANDBOX',
  VNPAY_SANDBOX: 'VNPAY_SANDBOX',
  MOCK_GATEWAY: 'MOCK_GATEWAY',
};

const PAYMENT_CURRENCY = {
  VND: 'VND',
};

const BOOKED_SEAT_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  BOOKED: 'booked',
};

const SHOWTIME_SEAT_STATUS = {
  AVAILABLE: 'available',
  HELD: 'held',
  BOOKED: 'booked',
  DISABLED: 'disabled',
};

const TICKET_STATUS = {
  ISSUED: 'issued',
  USED: 'used',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
};

const SEAT_TYPE = {
  REGULAR: 'regular',
  VIP: 'vip',
  COUPLE: 'couple',
  EMPTY: 'empty',
  AISLE: 'aisle',
  DISABLED: 'disabled',
};

const PAYMENT_TRANSACTION_STATUS = {
  PENDING: 'pending',
  GATEWAY_OPENED: 'gateway_opened',
  CALLBACK_PENDING: 'callback_pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  EXPIRED: 'expired',
};

const MOCK_BANK_ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const CALLBACK_LOG_STATUS = {
  RECEIVED: 'RECEIVED',
  PROCESSED: 'PROCESSED',
  DUPLICATE: 'DUPLICATE',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
};

const GATEWAY_PAYMENT_FIELDS = [
  'paymentId',
  'bookingId',
  'amount',
  'currency',
  'expiredAt',
  'receiverAccountNo',
  'callbackUrl',
  'returnUrl',
];

const PAYMENT_CALLBACK_FIELDS = [
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
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_CURRENCY,
  BOOKED_SEAT_STATUS,
  SHOWTIME_SEAT_STATUS,
  TICKET_STATUS,
  SEAT_TYPE,
  PAYMENT_TRANSACTION_STATUS,
  MOCK_BANK_ACCOUNT_STATUS,
  CALLBACK_LOG_STATUS,
  GATEWAY_PAYMENT_FIELDS,
  PAYMENT_CALLBACK_FIELDS,
};
