export type PaymentResultStatus =
  | 'cancelled'
  | 'expired'
  | 'failed'
  | 'processing'
  | 'success'
  | 'unknown';

export type PaymentResult = {
  status: PaymentResultStatus;
  bookingId: string | null;
  paymentId: string | null;
  transactionCode: string | null;
  message: string | null;
};

const supportedStatuses = new Set<PaymentResultStatus>([
  'cancelled',
  'expired',
  'failed',
  'processing',
  'success',
]);

const normalizeStatus = (value: string | null): PaymentResultStatus => {
  const normalized = String(value || '').trim().toLowerCase();

  return supportedStatuses.has(normalized as PaymentResultStatus)
    ? (normalized as PaymentResultStatus)
    : 'unknown';
};

const readSearchParams = (url: string) => {
  try {
    return new URL(url).searchParams;
  } catch {
    const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : url;
    return new URLSearchParams(query);
  }
};

export const parsePaymentResultUrl = (url: string): PaymentResult => {
  const params = readSearchParams(url);

  return {
    status: normalizeStatus(params.get('status')),
    bookingId: params.get('bookingId'),
    paymentId: params.get('paymentId'),
    transactionCode: params.get('transactionCode'),
    message: params.get('message'),
  };
};

export const isSuccessfulPaymentResult = (result: PaymentResult) =>
  result.status === 'success' && Boolean(result.bookingId);
