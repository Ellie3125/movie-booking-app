const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const PaymentTransaction = require('../models/PaymentTransaction');
const ApiError = require('../utils/apiError');
const env = require('../config/env');
const { SEAT_PRICE_MAP } = require('../config/seatPricing');
const {
  BOOKED_SEAT_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_TRANSACTION_STATUS,
  SHOWTIME_SEAT_STATUS,
} = require('../constants/payment.constants');

const BOOKING_POPULATE = [
  {
    path: 'movieId',
    select: 'title duration poster status',
  },
  {
    path: 'roomId',
    select: 'name screenLabel totalRows totalColumns',
  },
  {
    path: 'showtimeId',
    select: 'startTime endTime cinemaId',
    populate: {
      path: 'cinemaId',
      select: 'name brand city address',
    },
  },
];

const getEntityId = (value) => (value && value._id ? value._id : value);

const getBookingQuery = (filter) => {
  const query = Booking.find(filter).sort({ createdAt: -1 });

  BOOKING_POPULATE.forEach((populate) => {
    query.populate(populate);
  });

  return query;
};

const getOwnedBookingOrThrow = async (bookingId, userId) => {
  const booking = await getBookingQuery({
    _id: bookingId,
    userId,
  })
    .limit(1)
    .then((items) => items[0] || null);

  if (!booking) {
    const existingBooking = await Booking.findById(bookingId)
      .select('_id userId')
      .lean()
      .exec();

    if (!existingBooking) {
      throw ApiError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
    }

    throw ApiError.forbidden(
      'You do not have permission to access this booking',
      'BOOKING_ACCESS_DENIED'
    );
  }

  return booking;
};

const flattenSeatLayout = (room) =>
  room.seatLayout
    .flat()
    .filter((seat) => seat && seat.cellType === 'seat' && seat.coordinate);

const buildRoomSeatMap = (room) =>
  new Map(
    flattenSeatLayout(room).map((seat) => [
      seat.coordinate.coordinateLabel.toUpperCase(),
      seat,
    ])
  );

const getSeatPrice = (seatType) => {
  const price = SEAT_PRICE_MAP[seatType];

  if (typeof price !== 'number') {
    throw ApiError.internal(
      `Seat price is not configured for seat type: ${seatType}`,
      'SEAT_PRICE_NOT_CONFIGURED'
    );
  }

  return price;
};

const getEffectivePaymentStatus = (booking) => {
  if (booking.paymentStatus === PAYMENT_STATUS.SUCCESS || booking.paidAt) {
    return PAYMENT_STATUS.SUCCESS;
  }

  if (
    booking.paymentStatus !== PAYMENT_STATUS.SUCCESS &&
    booking.paymentExpiresAt &&
    new Date(booking.paymentExpiresAt).getTime() <= Date.now()
  ) {
    return PAYMENT_STATUS.EXPIRED;
  }

  return booking.paymentStatus || PAYMENT_STATUS.PENDING;
};

const mapBookingResponse = (booking) => ({
  bookingId: String(booking._id),
  bookingCode: booking.bookingCode || null,
  status: booking.status,
  paymentStatus: getEffectivePaymentStatus(booking),
  paymentMethod: booking.paymentMethod || null,
  currency: booking.currency || env.paymentCurrency,
  totalAmount: booking.totalAmount,
  totalPrice: booking.totalAmount,
  ticketCount: Array.isArray(booking.seats) ? booking.seats.length : 0,
  createdAt: booking.createdAt,
  paidAt: booking.paidAt,
  paymentExpiresAt: booking.paymentExpiresAt,
  paymentSummary: booking.paymentSummary || null,
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
  seats: (booking.seats || []).map((seat) => ({
    seatCoordinate: seat.seatCoordinate,
    seatLabel: seat.seatLabel,
    seatType: seat.seatType,
    status: seat.status,
    price: seat.price,
  })),
});

const markBookingTransactionsAsExpired = async (bookingIds) => {
  if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
    return;
  }

  await PaymentTransaction.updateMany(
    {
      bookingId: { $in: bookingIds },
      status: {
        $in: [
          PAYMENT_TRANSACTION_STATUS.PENDING,
          PAYMENT_TRANSACTION_STATUS.GATEWAY_OPENED,
          PAYMENT_TRANSACTION_STATUS.CALLBACK_PENDING,
        ],
      },
    },
    {
      $set: {
        status: PAYMENT_TRANSACTION_STATUS.EXPIRED,
        failureReason: 'Booking payment window expired',
      },
    }
  ).exec();
};

const cleanupExpiredHeldSeats = async (showtime) => {
  const expiredBookingIds = new Set();
  let hasChanges = false;

  showtime.seatStates.forEach((seatState) => {
    if (
      seatState.status === SHOWTIME_SEAT_STATUS.HELD &&
      seatState.holdExpiresAt &&
      new Date(seatState.holdExpiresAt).getTime() <= Date.now()
    ) {
      hasChanges = true;

      if (seatState.bookingId) {
        expiredBookingIds.add(String(seatState.bookingId));
      }

      seatState.status = SHOWTIME_SEAT_STATUS.AVAILABLE;
      seatState.userId = null;
      seatState.bookingId = null;
      seatState.heldAt = null;
      seatState.holdExpiresAt = null;
      seatState.paidAt = null;
    }
  });

  if (hasChanges) {
    await showtime.save();
  }

  if (expiredBookingIds.size > 0) {
    const bookingIds = [...expiredBookingIds];

    await Booking.updateMany(
      {
        _id: { $in: bookingIds },
        status: BOOKING_STATUS.PENDING_PAYMENT,
      },
      {
        $set: {
          status: BOOKING_STATUS.CANCELLED,
          paymentStatus: PAYMENT_STATUS.EXPIRED,
        },
      }
    ).exec();

    await markBookingTransactionsAsExpired(bookingIds);
  }
};

const assertShowtimeIsBookable = (showtime) => {
  if (new Date(showtime.startTime).getTime() <= Date.now()) {
    throw ApiError.conflict(
      'This showtime has already started and can no longer be booked',
      'SHOWTIME_ALREADY_STARTED'
    );
  }
};

const normalizeSeatCoordinates = (seatCoordinates) =>
  seatCoordinates.map((seatCoordinate) => seatCoordinate.trim().toUpperCase());

const createBooking = async ({ userId, showtimeId, seatCoordinates }) => {
  if (!mongoose.isValidObjectId(showtimeId)) {
    throw ApiError.badRequest('Showtime id is invalid', 'INVALID_OBJECT_ID');
  }

  const showtime = await Showtime.findById(showtimeId)
    .populate('movieId', 'title duration poster status')
    .populate('cinemaId', 'name brand city address')
    .populate('roomId', 'name screenLabel totalRows totalColumns seatLayout')
    .exec();

  if (!showtime) {
    throw ApiError.notFound('Showtime not found', 'SHOWTIME_NOT_FOUND');
  }

  assertShowtimeIsBookable(showtime);
  await cleanupExpiredHeldSeats(showtime);

  const room = showtime.roomId;

  if (!room || !Array.isArray(room.seatLayout)) {
    throw ApiError.internal(
      'Room seat layout is missing for this showtime',
      'ROOM_LAYOUT_NOT_FOUND'
    );
  }

  const roomSeatMap = buildRoomSeatMap(room);
  const showtimeSeatStateMap = new Map(
    showtime.seatStates.map((seatState) => [
      seatState.seatCoordinate.toUpperCase(),
      seatState,
    ])
  );
  const normalizedSeatCoordinates = normalizeSeatCoordinates(seatCoordinates);

  const seats = normalizedSeatCoordinates.map((seatCoordinate) => {
    const roomSeat = roomSeatMap.get(seatCoordinate);
    const seatState = showtimeSeatStateMap.get(seatCoordinate);

    if (!roomSeat || !seatState) {
      throw ApiError.badRequest(
        `Seat ${seatCoordinate} does not exist in the selected room`,
        'INVALID_SEAT_COORDINATE'
      );
    }

    if (seatState.status !== SHOWTIME_SEAT_STATUS.AVAILABLE) {
      throw ApiError.conflict(
        `Seat ${seatState.seatLabel} is not available`,
        'SEAT_NOT_AVAILABLE'
      );
    }

    return {
      seatCoordinate,
      seatLabel: roomSeat.seatLabel,
      seatType: roomSeat.seatType,
      status: BOOKED_SEAT_STATUS.PENDING_PAYMENT,
      price: getSeatPrice(roomSeat.seatType),
    };
  });

  const now = new Date();
  const paymentExpiresAt = new Date(
    now.getTime() + env.bookingHoldTtlMinutes * 60 * 1000
  );
  const booking = new Booking({
    _id: new mongoose.Types.ObjectId(),
    userId,
    movieId: getEntityId(showtime.movieId),
    showtimeId: showtime._id,
    roomId: getEntityId(showtime.roomId),
    seats,
    totalAmount: seats.reduce((sum, seat) => sum + seat.price, 0),
    status: BOOKING_STATUS.PENDING_PAYMENT,
    paymentStatus: PAYMENT_STATUS.PENDING,
    currency: env.paymentCurrency,
    paymentExpiresAt,
  });

  normalizedSeatCoordinates.forEach((seatCoordinate) => {
    const seatState = showtimeSeatStateMap.get(seatCoordinate);
    seatState.status = SHOWTIME_SEAT_STATUS.HELD;
    seatState.userId = userId;
    seatState.bookingId = booking._id;
    seatState.heldAt = now;
    seatState.holdExpiresAt = paymentExpiresAt;
    seatState.paidAt = null;
  });

  await Promise.all([booking.save(), showtime.save()]);

  const savedBooking = await getOwnedBookingOrThrow(booking._id, userId);
  return mapBookingResponse(savedBooking);
};

const listMyBookings = async ({ userId, status, paymentStatus }) => {
  const filter = { userId };

  if (status) {
    filter.status = status;
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  const [items, total] = await Promise.all([
    getBookingQuery(filter).lean().exec(),
    Booking.countDocuments(filter),
  ]);

  return {
    items: items.map(mapBookingResponse),
    total,
  };
};

const getMyBookingById = async ({ bookingId, userId }) => {
  if (!mongoose.isValidObjectId(bookingId)) {
    throw ApiError.badRequest('Booking id is invalid', 'INVALID_OBJECT_ID');
  }

  const booking = await getOwnedBookingOrThrow(bookingId, userId);
  return mapBookingResponse(booking.toObject ? booking.toObject() : booking);
};

const cancelBooking = async ({ bookingId, userId }) => {
  if (!mongoose.isValidObjectId(bookingId)) {
    throw ApiError.badRequest('Booking id is invalid', 'INVALID_OBJECT_ID');
  }

  const booking = await getOwnedBookingOrThrow(bookingId, userId);

  if (
    booking.status === BOOKING_STATUS.CONFIRMED ||
    booking.paymentStatus === PAYMENT_STATUS.SUCCESS ||
    booking.paidAt
  ) {
    throw ApiError.conflict(
      'Confirmed booking cannot be cancelled by the hold release endpoint',
      'BOOKING_ALREADY_CONFIRMED'
    );
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw ApiError.conflict(
      'Booking has already been cancelled',
      'BOOKING_ALREADY_CANCELLED'
    );
  }

  const showtime = await Showtime.findById(getEntityId(booking.showtimeId)).exec();

  if (!showtime) {
    throw ApiError.notFound(
      'Showtime not found for this booking',
      'SHOWTIME_NOT_FOUND'
    );
  }

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
  booking.paymentStatus =
    booking.paymentExpiresAt &&
    new Date(booking.paymentExpiresAt).getTime() <= Date.now()
      ? PAYMENT_STATUS.EXPIRED
      : PAYMENT_STATUS.FAILED;
  booking.paymentExpiresAt = null;

  await Promise.all([
    booking.save(),
    showtime.save(),
    PaymentTransaction.updateMany(
      {
        bookingId: booking._id,
        status: {
          $in: [
            PAYMENT_TRANSACTION_STATUS.PENDING,
            PAYMENT_TRANSACTION_STATUS.GATEWAY_OPENED,
            PAYMENT_TRANSACTION_STATUS.CALLBACK_PENDING,
          ],
        },
      },
      {
        $set: {
          status: PAYMENT_TRANSACTION_STATUS.FAILED,
          failureReason: 'Booking cancelled by user',
        },
      }
    ).exec(),
  ]);

  return mapBookingResponse(booking.toObject ? booking.toObject() : booking);
};

module.exports = {
  createBooking,
  listMyBookings,
  getMyBookingById,
  cancelBooking,
};
