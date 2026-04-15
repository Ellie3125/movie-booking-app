const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Ticket = require('../models/Ticket');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const {
  PAYMENT_HMAC_FIELDS,
  generatePaymentSignature,
  verifyPaymentSignature,
} = require('../utils/hmac');

const BOOKING_STATUS = {
  HELD: 'held',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  EXPIRED: 'expired',
};

const SHOWTIME_SEAT_STATUS = {
  AVAILABLE: 'available',
  HELD: 'held',
  RESERVED: 'reserved',
  PAID: 'paid',
};

const getCurrentPaymentStatus = (booking) => {
  if (booking.paymentStatus) {
    return booking.paymentStatus;
  }

  if (booking.paidAt || booking.status === BOOKING_STATUS.PAID) {
    return PAYMENT_STATUS.PAID;
  }

  return PAYMENT_STATUS.PENDING;
};

const createTransactionCode = () =>
  `TXN-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase()}`;

const createTicketCode = () =>
  `TICKET-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;

const getEntityId = (value) => (value && value._id ? value._id : value);

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
    .populate('roomId', 'name screenLabel totalRows totalColumns activeSeatCount')
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

const findBookingSeatStates = (booking, showtime) => {
  const bookingSeatCoordinates = new Set(
    booking.seats.map((seat) => seat.seatCoordinate.toUpperCase())
  );

  return showtime.seatStates.filter((seatState) =>
    bookingSeatCoordinates.has(seatState.seatCoordinate.toUpperCase())
  );
};

const resolvePaymentExpiresAt = (booking, showtime) => {
  if (booking.paymentExpiresAt) {
    return booking.paymentExpiresAt;
  }

  const matchedSeatStates = findBookingSeatStates(booking, showtime);
  const expiryDates = matchedSeatStates
    .map((seatState) => seatState.holdExpiresAt)
    .filter(Boolean)
    .map((value) => new Date(value));

  if (!expiryDates.length) {
    return null;
  }

  return new Date(Math.min(...expiryDates.map((date) => date.getTime())));
};

const isExpired = (expiresAt) =>
  Boolean(expiresAt) && new Date(expiresAt).getTime() <= Date.now();

const assertBookingIsAwaitingPayment = (booking, expiresAt) => {
  const paymentStatus = getCurrentPaymentStatus(booking);

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw ApiError.conflict(
      'Booking has already been cancelled',
      'BOOKING_CANCELLED'
    );
  }

  if (
    booking.status === BOOKING_STATUS.PAID ||
    paymentStatus === PAYMENT_STATUS.PAID ||
    booking.paidAt
  ) {
    throw ApiError.conflict(
      'Booking has already been paid',
      'BOOKING_ALREADY_PAID'
    );
  }

  if (paymentStatus === PAYMENT_STATUS.EXPIRED || isExpired(expiresAt)) {
    throw ApiError.conflict(
      'Booking payment window has expired',
      'BOOKING_PAYMENT_EXPIRED'
    );
  }

  if (booking.status !== BOOKING_STATUS.HELD) {
    throw ApiError.conflict(
      'Booking is not awaiting payment',
      'BOOKING_NOT_AWAITING_PAYMENT'
    );
  }
};

const buildPaymentSignaturePayload = ({
  bookingId,
  userId,
  paidAmount,
  currency,
  timestamp,
}) => ({
  bookingId: String(bookingId),
  userId: String(userId),
  paidAmount: Number(paidAmount),
  currency,
  timestamp: Number(timestamp),
});

const validateTimestamp = (timestamp) => {
  const now = Date.now();
  const ageInSeconds = Math.abs(now - Number(timestamp)) / 1000;

  if (ageInSeconds > env.paymentSignatureTtlSeconds) {
    throw ApiError.badRequest(
      'Payment timestamp has expired',
      'PAYMENT_TIMESTAMP_EXPIRED'
    );
  }
};

const ensurePaymentHoldsAreStillValid = (booking, showtime, userId) => {
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

    if (seatState.userId && String(seatState.userId) !== String(userId)) {
      throw ApiError.conflict(
        'One or more booking seats are held by another user',
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

const releaseHeldSeatsForExpiredBooking = async (booking, showtime) => {
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

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.paymentStatus = PAYMENT_STATUS.EXPIRED;

  await Promise.all([booking.save(), showtime.save()]);
};

const markBookingAndSeatsAsPaid = async ({
  booking,
  showtime,
  matchedSeatStates,
  paymentMethod,
  paidAmount,
  currency,
  timestamp,
  signature,
  verifiedAt,
  transactionCode,
}) => {
  booking.status = BOOKING_STATUS.PAID;
  booking.paymentStatus = PAYMENT_STATUS.PAID;
  booking.paymentMethod = paymentMethod;
  booking.currency = currency;
  booking.paymentExpiresAt = null;
  booking.paidAt = verifiedAt;
  booking.transactionCode = transactionCode;
  booking.paymentSnapshot = {
    paidAmount,
    currency,
    timestamp,
    signature,
    verifiedAt,
  };

  booking.seats.forEach((seat) => {
    seat.status = 'paid';
  });

  matchedSeatStates.forEach((seatState) => {
    seatState.status = SHOWTIME_SEAT_STATUS.PAID;
    seatState.bookingId = booking._id;
    seatState.userId = booking.userId;
    seatState.heldAt = null;
    seatState.holdExpiresAt = null;
    seatState.paidAt = verifiedAt;
  });

  await Promise.all([booking.save(), showtime.save()]);
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
    const generatedTicketCode = createTicketCode();

    const updateDocument = {
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
      status: 'active',
      issuedAt: existingTicket ? existingTicket.issuedAt : paidAt,
    };

    return {
      updateOne: {
        filter: existingTicket
          ? { _id: existingTicket._id }
          : {
              bookingId: booking._id,
              'seat.seatCoordinate': seat.seatCoordinate,
            },
        update: {
          $set: updateDocument,
          $setOnInsert: {
            ticketCode: generatedTicketCode,
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
    .select('ticketCode status seat price issuedAt')
    .lean()
    .exec();
};

const mapBillResponse = ({ booking, expiresAt, signatureData }) => ({
  bookingId: String(booking._id),
  bookingCode: booking.bookingCode || null,
  movie: booking.movieId
    ? {
        id: String(booking.movieId._id),
        title: booking.movieId.title,
        duration: booking.movieId.duration,
        poster: booking.movieId.poster,
        status: booking.movieId.status,
      }
    : null,
  cinema: booking.showtimeId?.cinemaId
    ? {
        id: String(booking.showtimeId.cinemaId._id),
        name: booking.showtimeId.cinemaId.name,
        brand: booking.showtimeId.cinemaId.brand,
        city: booking.showtimeId.cinemaId.city,
        address: booking.showtimeId.cinemaId.address,
      }
    : null,
  room: booking.roomId
    ? {
        id: String(booking.roomId._id),
        name: booking.roomId.name,
        screenLabel: booking.roomId.screenLabel,
        totalRows: booking.roomId.totalRows,
        totalColumns: booking.roomId.totalColumns,
      }
    : null,
  showtime: booking.showtimeId
    ? {
        id: String(booking.showtimeId._id),
        startTime: booking.showtimeId.startTime,
        endTime: booking.showtimeId.endTime,
      }
    : null,
  seats: booking.seats.map((seat) => ({
    seatCoordinate: seat.seatCoordinate,
    seatLabel: seat.seatLabel,
    seatType: seat.seatType,
    price: seat.price,
    status: seat.status,
  })),
  ticketCount: booking.seats.length,
  totalPrice: booking.totalPrice,
  currency: booking.currency || env.paymentCurrency,
  status: booking.status,
  paymentStatus: getCurrentPaymentStatus(booking),
  paymentExpiresAt: expiresAt,
  paymentAuth: {
    algorithm: 'HMAC-SHA256',
    fields: PAYMENT_HMAC_FIELDS,
    paidAmount: signatureData.paidAmount,
    currency: signatureData.currency,
    timestamp: signatureData.timestamp,
    signature: signatureData.signature,
  },
});

const getBill = async ({ bookingId, userId }) => {
  const booking = await getOwnedBooking(bookingId, userId);
  const showtime = booking.showtimeId;
  const expiresAt = resolvePaymentExpiresAt(booking, showtime);

  assertBookingIsAwaitingPayment(booking, expiresAt);

  const timestamp = Date.now();
  const signaturePayload = buildPaymentSignaturePayload({
    bookingId: booking._id,
    userId,
    paidAmount: booking.totalPrice,
    currency: booking.currency || env.paymentCurrency,
    timestamp,
  });

  return mapBillResponse({
    booking,
    expiresAt,
    signatureData: {
      ...signaturePayload,
      signature: generatePaymentSignature(signaturePayload),
    },
  });
};

const payBill = async ({
  bookingId,
  userId,
  paymentMethod,
  paidAmount,
  currency,
  timestamp,
  signature,
}) => {
  const booking = await getOwnedBooking(bookingId, userId);
  const showtime = await Showtime.findById(booking.showtimeId._id).exec();

  if (!showtime) {
    throw ApiError.notFound('Showtime not found for this booking', 'SHOWTIME_NOT_FOUND');
  }

  const expiresAt = resolvePaymentExpiresAt(booking, showtime);

  if (isExpired(expiresAt)) {
    await releaseHeldSeatsForExpiredBooking(booking, showtime);

    throw ApiError.conflict(
      'Booking payment window has expired',
      'BOOKING_PAYMENT_EXPIRED'
    );
  }

  assertBookingIsAwaitingPayment(booking, expiresAt);

  if (Number(paidAmount) !== Number(booking.totalPrice)) {
    throw ApiError.badRequest(
      'Paid amount does not match the booking total price',
      'PAYMENT_AMOUNT_MISMATCH'
    );
  }

  if (currency !== (booking.currency || env.paymentCurrency)) {
    throw ApiError.badRequest(
      'Payment currency does not match the booking currency',
      'PAYMENT_CURRENCY_MISMATCH'
    );
  }

  validateTimestamp(timestamp);

  const signaturePayload = buildPaymentSignaturePayload({
    bookingId: booking._id,
    userId,
    paidAmount,
    currency,
    timestamp,
  });

  if (!verifyPaymentSignature(signaturePayload, signature)) {
    throw ApiError.badRequest(
      'Payment signature is invalid',
      'INVALID_PAYMENT_SIGNATURE'
    );
  }

  const matchedSeatStates = ensurePaymentHoldsAreStillValid(booking, showtime, userId);
  const paidAt = new Date();
  const transactionCode = createTransactionCode();

  await markBookingAndSeatsAsPaid({
    booking,
    showtime,
    matchedSeatStates,
    paymentMethod,
    paidAmount,
    currency,
    timestamp,
    signature,
    verifiedAt: paidAt,
    transactionCode,
  });

  const tickets = await upsertTicketsForBooking(booking, paidAt);

  return {
    bookingId: String(booking._id),
    bookingCode: booking.bookingCode || null,
    transactionCode,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod,
    paidAmount: booking.totalPrice,
    currency: booking.currency,
    paidAt: booking.paidAt,
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

module.exports = {
  getBill,
  payBill,
};
