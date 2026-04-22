const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Ticket = require('../models/Ticket');
const PaymentTransaction = require('../models/PaymentTransaction');
const PaymentCallbackLog = require('../models/PaymentCallbackLog');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { signHmacSha256, verifyHmacSha256 } = require('../utils/paymentHmac');
const {
  CALLBACK_LOG_STATUS,
  BOOKED_SEAT_STATUS,
  BOOKING_STATUS,
  GATEWAY_PAYMENT_FIELDS,
  PAYMENT_CALLBACK_FIELDS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  PAYMENT_TRANSACTION_STATUS,
  SHOWTIME_SEAT_STATUS,
  TICKET_STATUS,
} = require('../constants/payment.constants');
const {
  getPaymentReceiverAccount,
  buildGatewayPayload,
} = require('../utils/paymentPayloads');

const GATEWAY_SECRET_LABEL = 'PAYMENT_GATEWAY_SECRET';
const CALLBACK_SECRET_LABEL = 'PAYMENT_CALLBACK_SECRET';

const ACTIVE_GATEWAY_TRANSACTION_STATUSES = [
  PAYMENT_TRANSACTION_STATUS.PENDING,
  PAYMENT_TRANSACTION_STATUS.GATEWAY_OPENED,
];

const PENDING_TRANSACTION_STATUSES = [
  PAYMENT_TRANSACTION_STATUS.PENDING,
  PAYMENT_TRANSACTION_STATUS.GATEWAY_OPENED,
  PAYMENT_TRANSACTION_STATUS.CALLBACK_PENDING,
];

const getEntityId = (value) => (value && value._id ? value._id : value);

const createPaymentId = () =>
  `PAY-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase()}`;

const createTransactionCode = () =>
  `MOCKTX-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase()}`;

const createTicketCode = () =>
  `TICKET-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;

const createIdempotencyKey = (canonicalString, signature) =>
  crypto
    .createHash('sha256')
    .update(`${canonicalString}|${String(signature || '')}`)
    .digest('hex');

const validateObjectId = (id, resourceName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(
      `${resourceName} id is invalid`,
      'INVALID_OBJECT_ID'
    );
  }
};

const getBookingPopulateQuery = (bookingId) =>
  Booking.findById(bookingId)
    .populate('movieId', 'title duration poster status')
    .populate('roomId', 'name screenLabel totalRows totalColumns')
    .populate({
      path: 'showtimeId',
      select: 'startTime endTime cinemaId roomId seatStates',
      populate: [
        {
          path: 'cinemaId',
          select: 'name brand city address',
        },
        {
          path: 'roomId',
          select: 'name screenLabel totalRows totalColumns',
        },
      ],
    });

const getOwnedBooking = async (bookingId, userId) => {
  validateObjectId(bookingId, 'Booking');

  const booking = await getBookingPopulateQuery(bookingId).exec();

  if (!booking) {
    throw ApiError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
  }

  if (String(booking.userId) !== String(userId)) {
    throw ApiError.forbidden(
      'You do not have permission to access this booking',
      'BOOKING_ACCESS_DENIED'
    );
  }

  return booking;
};

const getBookingByIdOrThrow = async (bookingId) => {
  validateObjectId(bookingId, 'Booking');

  const booking = await getBookingPopulateQuery(bookingId).exec();

  if (!booking) {
    throw ApiError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
  }

  return booking;
};

const isExpired = (dateValue) =>
  Boolean(dateValue) && new Date(dateValue).getTime() <= Date.now();

const findBookingSeatStates = (booking, showtime) => {
  const bookingSeatCoordinates = new Set(
    booking.seats.map((seat) => seat.seatCoordinate.toUpperCase())
  );

  return showtime.seatStates.filter((seatState) =>
    bookingSeatCoordinates.has(seatState.seatCoordinate.toUpperCase())
  );
};

const expirePendingTransactionsForBooking = async (bookingId, reason) => {
  await PaymentTransaction.updateMany(
    {
      bookingId,
      status: {
        $in: PENDING_TRANSACTION_STATUSES,
      },
    },
    {
      $set: {
        status: PAYMENT_TRANSACTION_STATUS.EXPIRED,
        failureReason: reason,
      },
    }
  ).exec();
};

const releaseHeldSeatsForBooking = (booking, showtime) => {
  const bookingSeatCoordinates = new Set(
    booking.seats.map((seat) => seat.seatCoordinate.toUpperCase())
  );

  showtime.seatStates.forEach((seatState) => {
    if (
      bookingSeatCoordinates.has(seatState.seatCoordinate.toUpperCase()) &&
      seatState.status === SHOWTIME_SEAT_STATUS.HELD
    ) {
      seatState.status = SHOWTIME_SEAT_STATUS.AVAILABLE;
      seatState.userId = null;
      seatState.bookingId = null;
      seatState.heldAt = null;
      seatState.holdExpiresAt = null;
      seatState.paidAt = null;
    }
  });
};

const expireBookingIfNeeded = async ({ booking, showtime }) => {
  if (!isExpired(booking.paymentExpiresAt)) {
    return false;
  }

  releaseHeldSeatsForBooking(booking, showtime);
  booking.status = BOOKING_STATUS.CANCELLED;
  booking.paymentStatus = PAYMENT_STATUS.EXPIRED;
  booking.paymentExpiresAt = null;

  await Promise.all([
    booking.save(),
    showtime.save(),
    expirePendingTransactionsForBooking(
      booking._id,
      'Booking payment window expired'
    ),
  ]);

  return true;
};

const assertBookingIsAwaitingPayment = (booking) => {
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw ApiError.conflict(
      'Booking has already been cancelled',
      'BOOKING_CANCELLED'
    );
  }

  if (
    booking.status === BOOKING_STATUS.CONFIRMED ||
    booking.paymentStatus === PAYMENT_STATUS.SUCCESS ||
    booking.paidAt
  ) {
    throw ApiError.conflict(
      'Booking has already been paid',
      'BOOKING_ALREADY_PAID'
    );
  }

  if (
    booking.paymentStatus === PAYMENT_STATUS.EXPIRED ||
    isExpired(booking.paymentExpiresAt)
  ) {
    throw ApiError.conflict(
      'Booking payment window has expired',
      'BOOKING_PAYMENT_EXPIRED'
    );
  }

  if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
    throw ApiError.conflict(
      'Booking is not awaiting payment',
      'BOOKING_NOT_AWAITING_PAYMENT'
    );
  }
};

const ensurePaymentHoldsAreStillValid = (booking, showtime) => {
  const matchedSeatStates = findBookingSeatStates(booking, showtime);

  if (matchedSeatStates.length !== booking.seats.length) {
    throw ApiError.conflict(
      'Booking seat states are inconsistent with the showtime data',
      'BOOKING_SEAT_STATE_MISMATCH'
    );
  }

  matchedSeatStates.forEach((seatState) => {
    if (seatState.status !== SHOWTIME_SEAT_STATUS.HELD) {
      throw ApiError.conflict(
        'One or more booking seats are no longer held for payment',
        'BOOKING_SEATS_NOT_HELD'
      );
    }

    if (
      seatState.bookingId &&
      String(seatState.bookingId) !== String(booking._id)
    ) {
      throw ApiError.conflict(
        'One or more booking seats are attached to another booking',
        'BOOKING_SEAT_HOLD_OWNERSHIP_MISMATCH'
      );
    }

    if (seatState.holdExpiresAt && new Date(seatState.holdExpiresAt) <= new Date()) {
      throw ApiError.conflict(
        'One or more booking seats have passed the hold timeout',
        'BOOKING_SEAT_HOLD_EXPIRED'
      );
    }
  });

  return matchedSeatStates;
};

const mapBillResponse = (booking) => ({
  bookingId: String(booking._id),
  seats: booking.seats.map((seat) => ({
    seatCoordinate: seat.seatCoordinate,
    seatLabel: seat.seatLabel,
    seatType: seat.seatType,
    price: seat.price,
  })),
  amount: booking.totalAmount,
  currency: booking.currency || env.paymentCurrency,
  expiredAt: booking.paymentExpiresAt,
});

const getActiveGatewayTransaction = async (bookingId) =>
  PaymentTransaction.findOne({
    bookingId,
    status: { $in: ACTIVE_GATEWAY_TRANSACTION_STATUSES },
    expiredAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .exec();

const getProcessingTransaction = async (bookingId) =>
  PaymentTransaction.findOne({
    bookingId,
    status: PAYMENT_TRANSACTION_STATUS.CALLBACK_PENDING,
    expiredAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .exec();

const markOldGatewayTransactionsExpired = async (bookingId) => {
  await PaymentTransaction.updateMany(
    {
      bookingId,
      status: { $in: ACTIVE_GATEWAY_TRANSACTION_STATUSES },
    },
    {
      $set: {
        status: PAYMENT_TRANSACTION_STATUS.EXPIRED,
        failureReason: 'Replaced by a newer payment attempt',
      },
    }
  ).exec();
};

const getPaymentReturnUrl = (baseUrl) =>
  env.paymentAppReturnUrl || `${baseUrl}/api/v1/payments/result`;

const createPaymentTransaction = async ({ booking, baseUrl }) => {
  const processingTransaction = await getProcessingTransaction(booking._id);

  if (processingTransaction) {
    throw ApiError.conflict(
      'A payment callback is currently being processed for this booking',
      'PAYMENT_CALLBACK_IN_PROGRESS'
    );
  }

  const reusableTransaction = await getActiveGatewayTransaction(booking._id);

  if (reusableTransaction) {
    return reusableTransaction;
  }

  await markOldGatewayTransactionsExpired(booking._id);

  const receiverAccount = getPaymentReceiverAccount();
  const transaction = new PaymentTransaction({
    bookingId: booking._id,
    userId: booking.userId,
    paymentId: createPaymentId(),
    amount: booking.totalAmount,
    currency: booking.currency || env.paymentCurrency,
    status: PAYMENT_TRANSACTION_STATUS.PENDING,
    receiverAccount,
    callbackUrl: `${baseUrl}/api/v1/payments/callback`,
    returnUrl: getPaymentReturnUrl(baseUrl),
    paymentUrl: '',
    expiredAt: booking.paymentExpiresAt,
    requestSignature: {
      canonicalString: '',
      signature: '',
      fields: GATEWAY_PAYMENT_FIELDS,
    },
  });

  const gatewayPayload = buildGatewayPayload(transaction);
  const { canonicalString, signature } = signHmacSha256({
    payload: gatewayPayload,
    fields: GATEWAY_PAYMENT_FIELDS,
    secret: env.paymentGatewaySecret,
    secretLabel: GATEWAY_SECRET_LABEL,
  });

  transaction.requestSignature = {
    algorithm: 'HMAC-SHA256',
    fields: GATEWAY_PAYMENT_FIELDS,
    canonicalString,
    signature,
  };
  transaction.paymentUrl = `${baseUrl}/mock-gateway/pay?paymentId=${encodeURIComponent(
    transaction.paymentId
  )}&signature=${encodeURIComponent(signature)}`;

  await transaction.save();

  return transaction;
};

const getBill = async ({ bookingId, userId }) => {
  const booking = await getOwnedBooking(bookingId, userId);
  const showtime = booking.showtimeId;

  if (!showtime) {
    throw ApiError.notFound(
      'Showtime not found for this booking',
      'SHOWTIME_NOT_FOUND'
    );
  }

  if (await expireBookingIfNeeded({ booking, showtime })) {
    throw ApiError.conflict(
      'Booking payment window has expired',
      'BOOKING_PAYMENT_EXPIRED'
    );
  }

  assertBookingIsAwaitingPayment(booking);

  return mapBillResponse(booking);
};

const payBill = async ({ bookingId, userId, baseUrl }) => {
  const booking = await getOwnedBooking(bookingId, userId);
  const showtime = booking.showtimeId;

  if (!showtime) {
    throw ApiError.notFound(
      'Showtime not found for this booking',
      'SHOWTIME_NOT_FOUND'
    );
  }

  if (await expireBookingIfNeeded({ booking, showtime })) {
    throw ApiError.conflict(
      'Booking payment window has expired',
      'BOOKING_PAYMENT_EXPIRED'
    );
  }

  assertBookingIsAwaitingPayment(booking);

  const transaction = await createPaymentTransaction({
    booking,
    baseUrl,
  });

  return {
    bookingId: String(booking._id),
    paymentId: transaction.paymentId,
    amount: transaction.amount,
    currency: transaction.currency,
    expiredAt: transaction.expiredAt,
    paymentUrl: transaction.paymentUrl,
  };
};

const getPaymentTransactionForGateway = async ({ paymentId, signature }) => {
  const transaction = await PaymentTransaction.findOne({ paymentId }).exec();

  if (!transaction) {
    throw ApiError.notFound('Payment transaction not found', 'PAYMENT_NOT_FOUND');
  }

  const gatewayPayload = buildGatewayPayload(transaction);
  const isValidSignature = verifyHmacSha256({
    payload: gatewayPayload,
    fields: GATEWAY_PAYMENT_FIELDS,
    secret: env.paymentGatewaySecret,
    signature,
    secretLabel: GATEWAY_SECRET_LABEL,
  });

  if (!isValidSignature) {
    throw ApiError.badRequest(
      'Payment signature is invalid',
      'INVALID_PAYMENT_SIGNATURE'
    );
  }

  if (isExpired(transaction.expiredAt)) {
    transaction.status = PAYMENT_TRANSACTION_STATUS.EXPIRED;
    transaction.failureReason = 'Payment transaction expired before gateway access';
    await transaction.save();

    throw ApiError.conflict(
      'Payment transaction has expired',
      'PAYMENT_TRANSACTION_EXPIRED'
    );
  }

  if (transaction.status === PAYMENT_TRANSACTION_STATUS.SUCCESS) {
    throw ApiError.conflict(
      'Payment transaction has already succeeded',
      'PAYMENT_TRANSACTION_ALREADY_SUCCESS'
    );
  }

  if (transaction.status === PAYMENT_TRANSACTION_STATUS.FAILED) {
    throw ApiError.conflict(
      'Payment transaction has already failed',
      'PAYMENT_TRANSACTION_FAILED'
    );
  }

  if (transaction.status === PAYMENT_TRANSACTION_STATUS.EXPIRED) {
    throw ApiError.conflict(
      'Payment transaction has expired',
      'PAYMENT_TRANSACTION_EXPIRED'
    );
  }

  return transaction;
};

const markGatewayOpened = async (transaction) => {
  if (transaction.status === PAYMENT_TRANSACTION_STATUS.PENDING) {
    transaction.status = PAYMENT_TRANSACTION_STATUS.GATEWAY_OPENED;
    transaction.gatewayOpenedAt = new Date();
    await transaction.save();
  }

  return transaction;
};

const upsertTicketsForBooking = async (booking, paidAt) => {
  const existingTickets = await Ticket.find({ bookingId: booking._id }).exec();
  const existingTicketMap = new Map(
    existingTickets.map((ticket) => [
      ticket.seat.seatCoordinate.toUpperCase(),
      ticket,
    ])
  );

  const bulkOperations = booking.seats.map((seat) => {
    const existingTicket = existingTicketMap.get(seat.seatCoordinate.toUpperCase());

    return {
      updateOne: {
        filter: existingTicket
          ? { _id: existingTicket._id }
          : {
              bookingId: booking._id,
              'seat.seatCoordinate': seat.seatCoordinate,
            },
        update: {
          $set: {
            bookingId: booking._id,
            userId: booking.userId,
            movieId: getEntityId(booking.movieId),
            showtimeId: getEntityId(booking.showtimeId),
            roomId: getEntityId(booking.roomId),
            seat: {
              seatCoordinate: seat.seatCoordinate,
              seatLabel: seat.seatLabel,
              seatType: seat.seatType,
            },
            price: seat.price,
            status: TICKET_STATUS.ISSUED,
            issuedAt: existingTicket ? existingTicket.issuedAt : paidAt,
          },
          $setOnInsert: {
            ticketCode: createTicketCode(),
          },
        },
        upsert: true,
      },
    };
  });

  if (bulkOperations.length > 0) {
    await Ticket.bulkWrite(bulkOperations);
  }

  return Ticket.find({ bookingId: booking._id })
    .select('-_id ticketCode status seat price issuedAt')
    .lean()
    .exec();
};

const finalizeSuccessfulPayment = async ({
  transaction,
  callbackPayload,
  callbackSignature,
  callbackCanonicalString,
  callbackLog,
}) => {
  const booking = await getBookingByIdOrThrow(callbackPayload.bookingId);
  const showtime = await Showtime.findById(getEntityId(booking.showtimeId)).exec();

  if (!showtime) {
    throw ApiError.notFound(
      'Showtime not found for this booking',
      'SHOWTIME_NOT_FOUND'
    );
  }

  if (await expireBookingIfNeeded({ booking, showtime })) {
    throw ApiError.conflict(
      'Booking payment window has expired',
      'BOOKING_PAYMENT_EXPIRED'
    );
  }

  assertBookingIsAwaitingPayment(booking);

  if (String(transaction.bookingId) !== String(booking._id)) {
    throw ApiError.conflict(
      'Payment transaction does not belong to the booking',
      'PAYMENT_BOOKING_MISMATCH'
    );
  }

  if (Number(callbackPayload.paidAmount) !== Number(transaction.amount)) {
    throw ApiError.badRequest(
      'paidAmount does not match the original payment amount',
      'PAYMENT_AMOUNT_MISMATCH'
    );
  }

  if (Number(callbackPayload.paidAmount) !== Number(booking.totalAmount)) {
    throw ApiError.badRequest(
      'paidAmount does not match the booking amount',
      'BOOKING_AMOUNT_MISMATCH'
    );
  }

  if (callbackPayload.currency !== transaction.currency) {
    throw ApiError.badRequest(
      'currency does not match the original payment currency',
      'PAYMENT_CURRENCY_MISMATCH'
    );
  }

  if (
    callbackPayload.receiverAccountNo !== transaction.receiverAccount.accountNo
  ) {
    throw ApiError.badRequest(
      'receiverAccountNo does not match the configured receiver account',
      'PAYMENT_RECEIVER_ACCOUNT_MISMATCH'
    );
  }

  if (
    transaction.transactionCode &&
    transaction.transactionCode !== callbackPayload.transactionCode
  ) {
    throw ApiError.badRequest(
      'transactionCode does not match the gateway transaction code',
      'PAYMENT_TRANSACTION_CODE_MISMATCH'
    );
  }

  if (
    transaction.sourceAccount &&
    transaction.sourceAccount.accountNo !== callbackPayload.sourceAccountNo
  ) {
    throw ApiError.badRequest(
      'sourceAccountNo does not match the gateway source account',
      'PAYMENT_SOURCE_ACCOUNT_MISMATCH'
    );
  }

  const matchedSeatStates = ensurePaymentHoldsAreStillValid(booking, showtime);
  const paidAt = new Date(callbackPayload.paidAt);
  const verifiedAt = new Date();

  booking.status = BOOKING_STATUS.CONFIRMED;
  booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
  booking.paymentMethod = PAYMENT_METHOD.MOCK_GATEWAY;
  booking.paymentExpiresAt = null;
  booking.paidAt = paidAt;
  booking.transactionCode = callbackPayload.transactionCode;
  booking.paymentSummary = {
    paymentId: transaction.paymentId,
    transactionCode: callbackPayload.transactionCode,
    paidAmount: callbackPayload.paidAmount,
    currency: callbackPayload.currency,
    sourceAccountNo: callbackPayload.sourceAccountNo,
    receiverAccountNo: callbackPayload.receiverAccountNo,
    paidAt,
    verifiedAt,
  };

  booking.seats.forEach((seat) => {
    seat.status = BOOKED_SEAT_STATUS.ISSUED;
  });

  matchedSeatStates.forEach((seatState) => {
    seatState.status = SHOWTIME_SEAT_STATUS.PAID;
    seatState.bookingId = booking._id;
    seatState.userId = booking.userId;
    seatState.heldAt = null;
    seatState.holdExpiresAt = null;
    seatState.paidAt = paidAt;
  });

  transaction.status = PAYMENT_TRANSACTION_STATUS.SUCCESS;
  transaction.transactionCode = callbackPayload.transactionCode;
  transaction.paidAt = paidAt;
  transaction.callbackReceivedAt = verifiedAt;
  transaction.callbackProcessedAt = verifiedAt;
  transaction.callbackAttempts += 1;
  transaction.callbackSignature = {
    algorithm: 'HMAC-SHA256',
    fields: PAYMENT_CALLBACK_FIELDS,
    canonicalString: callbackCanonicalString,
    signature: callbackSignature,
  };
  transaction.failureReason = null;

  callbackLog.status = CALLBACK_LOG_STATUS.PROCESSED;
  callbackLog.processedAt = verifiedAt;
  callbackLog.reason = 'Payment callback processed successfully';

  const ticketsPromise = upsertTicketsForBooking(booking, paidAt);

  await Promise.all([booking.save(), showtime.save(), transaction.save()]);
  const tickets = await ticketsPromise;
  await callbackLog.save();

  return {
    bookingId: String(booking._id),
    paymentId: transaction.paymentId,
    transactionCode: transaction.transactionCode,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    ticketCount: tickets.length,
    tickets: tickets.map((ticket) => ({
      ticketCode: ticket.ticketCode,
      status: ticket.status,
      seat: ticket.seat,
      price: ticket.price,
      issuedAt: ticket.issuedAt,
    })),
  };
};

const handlePaymentCallback = async ({
  paymentId,
  bookingId,
  paidAmount,
  currency,
  transactionCode,
  status,
  paidAt,
  sourceAccountNo,
  receiverAccountNo,
  signature,
}) => {
  const callbackPayload = {
    paymentId: String(paymentId),
    bookingId: String(bookingId),
    paidAmount: Number(paidAmount),
    currency,
    transactionCode: String(transactionCode),
    status,
    paidAt: new Date(paidAt).toISOString(),
    sourceAccountNo: String(sourceAccountNo),
    receiverAccountNo: String(receiverAccountNo),
  };

  const { canonicalString } = signHmacSha256({
    payload: callbackPayload,
    fields: PAYMENT_CALLBACK_FIELDS,
    secret: env.paymentCallbackSecret,
    secretLabel: CALLBACK_SECRET_LABEL,
  });
  const idempotencyKey = createIdempotencyKey(canonicalString, signature);

  const existingLog = await PaymentCallbackLog.findOne({ idempotencyKey }).exec();

  if (existingLog) {
    if (
      existingLog.status === CALLBACK_LOG_STATUS.PROCESSED ||
      existingLog.status === CALLBACK_LOG_STATUS.DUPLICATE
    ) {
      return {
        paymentId: callbackPayload.paymentId,
        transactionCode: callbackPayload.transactionCode,
        idempotent: true,
      };
    }

    throw ApiError.conflict(
      'This callback has already been handled',
      'CALLBACK_ALREADY_HANDLED'
    );
  }

  const callbackLog = await PaymentCallbackLog.create({
    paymentId: callbackPayload.paymentId,
    bookingId: callbackPayload.bookingId,
    transactionCode: callbackPayload.transactionCode,
    idempotencyKey,
    signature,
    canonicalString,
    payload: callbackPayload,
    status: CALLBACK_LOG_STATUS.RECEIVED,
  });

  try {
    const isValidSignature = verifyHmacSha256({
      payload: callbackPayload,
      fields: PAYMENT_CALLBACK_FIELDS,
      secret: env.paymentCallbackSecret,
      signature,
      secretLabel: CALLBACK_SECRET_LABEL,
    });

    if (!isValidSignature) {
      throw ApiError.badRequest(
        'Callback signature is invalid',
        'INVALID_CALLBACK_SIGNATURE'
      );
    }

    const transaction = await PaymentTransaction.findOne({
      paymentId: callbackPayload.paymentId,
    }).exec();

    if (!transaction) {
      throw ApiError.notFound(
        'Payment transaction not found',
        'PAYMENT_NOT_FOUND'
      );
    }

    if (transaction.status === PAYMENT_TRANSACTION_STATUS.SUCCESS) {
      callbackLog.status = CALLBACK_LOG_STATUS.DUPLICATE;
      callbackLog.processedAt = new Date();
      callbackLog.reason = 'Payment transaction was already confirmed';
      await callbackLog.save();

      return {
        paymentId: callbackPayload.paymentId,
        transactionCode: callbackPayload.transactionCode,
        idempotent: true,
      };
    }

    return await finalizeSuccessfulPayment({
      transaction,
      callbackPayload,
      callbackSignature: signature,
      callbackCanonicalString: canonicalString,
      callbackLog,
    });
  } catch (error) {
    callbackLog.status =
      error.statusCode && error.statusCode < 500
        ? CALLBACK_LOG_STATUS.REJECTED
        : CALLBACK_LOG_STATUS.FAILED;
    callbackLog.reason = error.message;
    callbackLog.processedAt = new Date();
    await callbackLog.save();
    throw error;
  }
};

const renderPaymentResultPage = ({ status, paymentId, bookingId, transactionCode }) => {
  const safeStatus = String(status || 'unknown').toLowerCase();
  const isSuccess = safeStatus === 'success';
  const heading = isSuccess ? 'Thanh toan thanh cong' : 'Thanh toan chua hoan tat';
  const description = isSuccess
    ? 'He thong da nhan callback va xac nhan booking.'
    : 'He thong chua the xac nhan giao dich. Vui long kiem tra lai booking.';

  return `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Payment Result</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #eef6ff, #fff6e8);
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        color: #1a1f36;
      }
      .card {
        width: min(92vw, 560px);
        background: #ffffff;
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.16);
      }
      h1 {
        margin-top: 0;
        margin-bottom: 12px;
      }
      p {
        line-height: 1.6;
      }
      .meta {
        margin-top: 24px;
        padding: 16px;
        border-radius: 16px;
        background: #f8fafc;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 10px;
      }
      .row:last-child {
        margin-bottom: 0;
      }
      .label {
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>${heading}</h1>
      <p>${description}</p>
      <section class="meta">
        <div class="row"><span class="label">paymentId</span><strong>${paymentId || '-'}</strong></div>
        <div class="row"><span class="label">bookingId</span><strong>${bookingId || '-'}</strong></div>
        <div class="row"><span class="label">transactionCode</span><strong>${transactionCode || '-'}</strong></div>
        <div class="row"><span class="label">status</span><strong>${safeStatus}</strong></div>
      </section>
    </main>
  </body>
</html>`;
};

module.exports = {
  getBill,
  payBill,
  getPaymentTransactionForGateway,
  markGatewayOpened,
  handlePaymentCallback,
  createTransactionCode,
  renderPaymentResultPage,
};
