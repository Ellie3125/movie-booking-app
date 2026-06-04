/**
 * SPEC Disclosure
 * Autonomous Decisions:
 * - Handled missing values by falling back to mockInfo, ensuring robustness during development and tests.
 * Deviations:
 * - None.
 * Trade-offs:
 * - None.
 * Context/Notes:
 * - The gateway still checks and requires the baseline fields. Extended user and booking details are only saved for visual representation.
 */
const QRCode = require('qrcode');
const { paymentRequests } = require('../configs/memoryDb');
const ApiError = require('../utils/apiError');
const env = require('../configs/env');
const {
  GATEWAY_PAYMENT_STATUS,
  PAYMENT_ACTION,
} = require('../constants/payment.constants');
const { CREATE_SESSION_FIELDS } = require('../constants/signature.constants');
const { createSignature, verifySignature } = require('../utils/hmac.util');
const {
  buildReturnUrl,
  buildQrContent,
  generateTransactionCode,
  isPaymentExpired,
} = require('../utils/payment.util');
const {
  listActiveMockBankAccounts,
  debitMockBankAccount,
} = require('./mockBankAccount.service');
const { sendPaymentCallback } = require('./callback.service');

// Mock Data Pool
const MOCK_MOVIES = [
  'Avengers: Endgame',
  'Spider-Man: No Way Home',
  'Dune: Part Two',
  'Oppenheimer',
  'Inside Out 2',
  'Interstellar',
  'The Batman',
  'Godzilla x Kong'
];
const MOCK_CINEMAS = [
  'CGV Vincom Center',
  'Lotte Cinema Landmark',
  'Galaxy Nguyễn Du',
  'BHD Star Bitexco',
  'CGV Aeon Mall'
];
const MOCK_NAMES = [
  'Nguyễn Văn A',
  'Trần Thị B',
  'Lê Văn C',
  'Phạm Thị D',
  'Hoàng Văn E',
  'Nguyễn Trần ABC',
  'Lê Thị XYZ',
  'Phạm Văn DEF'
];
const MOCK_SEATS = [
  ['D5', 'D6'],
  ['A1', 'A2', 'A3'],
  ['G10', 'G11'],
  ['E1', 'E2'],
  ['C3', 'C4'],
  ['B2', 'B3']
];

const generateMockInfo = () => {
  const movie = MOCK_MOVIES[Math.floor(Math.random() * MOCK_MOVIES.length)];
  const cinema = MOCK_CINEMAS[Math.floor(Math.random() * MOCK_CINEMAS.length)];
  const customerName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
  const seats = MOCK_SEATS[Math.floor(Math.random() * MOCK_SEATS.length)];
  const room = `Phòng 0${Math.floor(Math.random() * 8) + 1}`;
  const phone = '09' + Math.floor(10000000 + Math.random() * 90000000);
  const email = `${customerName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/\s+/g, '')}@example.com`;
  
  return {
    customerName,
    phone,
    email,
    movieTitle: movie,
    cinema,
    room,
    seats,
  };
};

const buildCreateSessionPayload = (input) => ({
  paymentId: input.paymentId,
  bookingId: input.bookingId,
  amount: Number(input.amount),
  currency: input.currency,
  receiverBankCode: input.receiverBankCode,
  receiverAccountNumber: input.receiverAccountNumber,
  receiverAccountName: input.receiverAccountName,
  callbackUrl: input.callbackUrl,
  returnUrl: input.returnUrl,
  expiredAt: new Date(input.expiredAt).toISOString(),
});

const getPaymentByIdOrThrow = async (paymentId) => {
  const payment = paymentRequests.get(paymentId);

  if (!payment) {
    throw ApiError.notFound('Gateway payment not found', 'PAYMENT_NOT_FOUND');
  }

  return payment;
};

const mapPaymentResponse = (payment, baseUrl = env.gatewayBaseUrl) => ({
  paymentId: payment.paymentId,
  bookingId: payment.bookingId,
  amount: payment.amount,
  currency: payment.currency,
  receiverBankCode: payment.receiverBankCode,
  receiverAccountNumber: payment.receiverAccountNumber,
  receiverAccountName: payment.receiverAccountName,
  status: payment.status,
  callbackUrl: payment.callbackUrl,
  returnUrl: payment.returnUrl,
  payerAccountNumber: payment.payerAccountNumber,
  transactionCode: payment.transactionCode,
  paidAt: payment.paidAt,
  expiredAt: payment.expiredAt,
  paymentUrl: `${baseUrl}/gateway/pay/${encodeURIComponent(payment.paymentId)}`,
  callbackAttempts: payment.callbackAttempts || 0,
  failureReason: payment.failureReason,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
  // Thêm các trường mock để FE sử dụng
  customerName: payment.customerName,
  phone: payment.phone,
  email: payment.email,
  movieTitle: payment.movieTitle,
  cinema: payment.cinema,
  room: payment.room,
  seats: payment.seats,
});

const expirePaymentIfNeeded = async (payment) => {
  if (
    payment.status !== GATEWAY_PAYMENT_STATUS.PENDING ||
    !isPaymentExpired(payment)
  ) {
    return {
      payment,
      callbackResult: null,
      expired: false,
    };
  }

  payment.status = GATEWAY_PAYMENT_STATUS.EXPIRED;
  payment.failureReason = 'Payment session has expired';
  payment.paidAt = null;
  payment.transactionCode = null;
  await payment.save();

  const callbackResult = await sendPaymentCallback(payment);

  return {
    payment,
    callbackResult,
    expired: true,
  };
};

const createPaymentSession = async ({ input, baseUrl }) => {
  if (!env.mainAppSignatureSecret) {
    throw ApiError.internal(
      'MAIN_APP_SIGNATURE_SECRET is not configured',
      'MAIN_APP_SIGNATURE_SECRET_NOT_CONFIGURED'
    );
  }

  const createSessionPayload = buildCreateSessionPayload(input);
  const isValidSignature = verifySignature({
    payload: createSessionPayload,
    fields: CREATE_SESSION_FIELDS,
    secret: env.mainAppSignatureSecret,
    signature: input.signature,
  });

  if (!isValidSignature) {
    throw ApiError.unauthorized(
      'Create-session signature is invalid',
      'INVALID_CREATE_SESSION_SIGNATURE'
    );
  }

  if (new Date(input.expiredAt).getTime() <= Date.now()) {
    throw ApiError.badRequest(
      'expiredAt must be later than the current time',
      'INVALID_EXPIRED_AT'
    );
  }

  const existingPayment = paymentRequests.get(input.paymentId);

  if (existingPayment) {
    throw ApiError.conflict(
      'paymentId already exists',
      'DUPLICATE_PAYMENT_ID'
    );
  }

  const { canonicalString, signature } = createSignature({
    payload: createSessionPayload,
    fields: CREATE_SESSION_FIELDS,
    secret: env.mainAppSignatureSecret,
  });

  const mockInfo = generateMockInfo();

  // Nhận thông tin thật từ Backend chính, nếu không có mới dùng mockInfo dự phòng
  const customerName = input.customerName || mockInfo.customerName;
  const phone = input.phone || mockInfo.phone;
  const email = input.email || mockInfo.email;
  const movieTitle = input.movieTitle || mockInfo.movieTitle;
  const cinema = input.cinema || mockInfo.cinema;
  const room = input.room || mockInfo.room;
  const seats = input.seats || mockInfo.seats;

  const payment = {
    paymentId: input.paymentId,
    bookingId: input.bookingId,
    amount: input.amount,
    currency: input.currency,
    receiverBankCode: input.receiverBankCode,
    receiverAccountNumber: input.receiverAccountNumber,
    receiverAccountName: input.receiverAccountName,
    status: GATEWAY_PAYMENT_STATUS.PENDING,
    callbackUrl: input.callbackUrl,
    returnUrl: input.returnUrl,
    expiredAt: new Date(input.expiredAt),
    requestSignature: signature,
    requestCanonicalString: canonicalString,
    requestPayload: createSessionPayload,
    
    // Lưu trữ thông tin thực tế/mock cho Frontend UI
    customerName,
    phone,
    email,
    movieTitle,
    cinema,
    room,
    seats,

    createdAt: new Date(),
    updatedAt: new Date(),
    save: async function () {
      this.updatedAt = new Date();
      return this;
    }
  };

  paymentRequests.set(input.paymentId, payment);

  return mapPaymentResponse(payment, baseUrl);
};

const getPaymentPageData = async (paymentId) => {
  const payment = await getPaymentByIdOrThrow(paymentId);
  await expirePaymentIfNeeded(payment);

  const [qrCodeDataUrl, mockAccounts] = await Promise.all([
    QRCode.toDataURL(buildQrContent(payment), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 280,
    }),
    listActiveMockBankAccounts(),
  ]);

  return {
    payment,
    qrCodeDataUrl,
    mockAccounts,
    paymentView: mapPaymentResponse(payment),
    remainingMs: Math.max(
      0,
      new Date(payment.expiredAt).getTime() - Date.now()
    ),
  };
};

const processFinalStatus = async ({ payment, status, payerAccountNumber }) => {
  payment.status = status;
  payment.payerAccountNumber = payerAccountNumber || null;

  if (status === GATEWAY_PAYMENT_STATUS.SUCCESS) {
    payment.transactionCode = generateTransactionCode();
    payment.paidAt = new Date();
    payment.failureReason = null;
  } else {
    payment.transactionCode = null;
    payment.paidAt = null;
  }

  await payment.save();
  const callbackResult = await sendPaymentCallback(payment);

  return {
    payment,
    callbackResult,
  };
};

const confirmPayment = async ({ paymentId, payerAccountNumber, action }) => {
  const payment = await getPaymentByIdOrThrow(paymentId);
  const expirationResult = await expirePaymentIfNeeded(payment);

  if (expirationResult.expired) {
    const redirectUrl = buildReturnUrl(payment, {
      message: 'Payment session expired',
      callbackSuccess: expirationResult.callbackResult?.isSuccess || false,
    });

    return {
      payment,
      callbackResult: expirationResult.callbackResult,
      redirectUrl,
      message: 'Payment session expired',
    };
  }

  if (payment.status !== GATEWAY_PAYMENT_STATUS.PENDING) {
    throw ApiError.conflict(
      `Payment is already ${payment.status}`,
      'PAYMENT_ALREADY_PROCESSED'
    );
  }

  let result = null;
  let message = 'Payment processed successfully';

  if (action === PAYMENT_ACTION.SUCCESS) {
    try {
      await debitMockBankAccount({
        payerAccountNumber,
        amount: payment.amount,
      });

      result = await processFinalStatus({
        payment,
        status: GATEWAY_PAYMENT_STATUS.SUCCESS,
        payerAccountNumber,
      });
      message = 'Payment marked as SUCCESS';
    } catch (error) {
      payment.failureReason = error.message;
      result = await processFinalStatus({
        payment,
        status: GATEWAY_PAYMENT_STATUS.FAILED,
        payerAccountNumber,
      });
      message = `Payment failed: ${error.message}`;
    }
  } else if (action === PAYMENT_ACTION.FAILED) {
    payment.failureReason = 'Payment was manually marked as FAILED';
    result = await processFinalStatus({
      payment,
      status: GATEWAY_PAYMENT_STATUS.FAILED,
      payerAccountNumber,
    });
    message = 'Payment marked as FAILED';
  } else if (action === PAYMENT_ACTION.CANCELLED) {
    payment.failureReason = 'Payment was cancelled by user';
    result = await processFinalStatus({
      payment,
      status: GATEWAY_PAYMENT_STATUS.CANCELLED,
      payerAccountNumber,
    });
    message = 'Payment marked as CANCELLED';
  } else {
    throw ApiError.badRequest(
      'Unsupported payment action',
      'UNSUPPORTED_PAYMENT_ACTION'
    );
  }

  const redirectUrl = buildReturnUrl(result.payment, {
    message,
    callbackSuccess: result.callbackResult?.isSuccess || false,
  });

  return {
    payment: result.payment,
    callbackResult: result.callbackResult,
    redirectUrl,
    message,
  };
};

module.exports = {
  createPaymentSession,
  getPaymentPageData,
  confirmPayment,
  mapPaymentResponse,
};
