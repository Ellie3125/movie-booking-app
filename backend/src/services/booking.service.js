const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const PaymentTransaction = require('../models/PaymentTransaction');
const ApiError = require('../utils/apiError');
const env = require('../config/env');
const { SEAT_PRICE_MAP } = require('../config/seatPricing');
const { sanitizeUserSummary } = require('../utils/userProfile');
const { getSeatDisplayLabel } = require('../utils/seatDisplay');
const {
  BOOKED_SEAT_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_TRANSACTION_STATUS,
  SHOWTIME_SEAT_STATUS,
  SEAT_TYPE,
} = require('../constants/payment.constants');

const BOOKING_POPULATE = [
  {
    path: 'userId',
    select: 'fullName email phoneNumber avatarUrl role',
  },
  {
    path: 'movieId',
    select: 'title duration poster status',
  },
  {
    path: 'roomId',
    select: 'name roomType totalRows totalColumns',
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

const buildEdgeSeatConflictMessage = (seatLabel) =>
  `Không thể để trống ghế ngoài cùng ${seatLabel}. Hãy chọn thêm ${seatLabel} hoặc đổi ghế khác.`;

const getEdgeSeatSelectionConflict = ({
  seatStates = [],
  selectedCoordinates = [],
}) => {
  const stateMap = new Map(
    seatStates.map((state) => [state.seatCode.toUpperCase(), state])
  );
  const selectedSet = new Set(
    selectedCoordinates.map((code) => code.toUpperCase())
  );

  // Group by rowIndex
  const rows = new Map();
  seatStates.forEach(state => {
    if (!rows.has(state.rowIndex)) rows.set(state.rowIndex, []);
    rows.get(state.rowIndex).push(state);
  });

  for (const [rowIndex, rowSeats] of rows) {
    // Sort by columnIndex
    const sortedSeats = rowSeats
      .filter(s => ![SEAT_TYPE.EMPTY, SEAT_TYPE.AISLE].includes(s.type))
      .sort((a, b) => a.columnIndex - b.columnIndex);

    if (sortedSeats.length < 2) continue;

    const firstSeat = sortedSeats[0];
    const secondSeat = sortedSeats[1];

    if (
      firstSeat.status === SHOWTIME_SEAT_STATUS.AVAILABLE &&
      !selectedSet.has(firstSeat.seatCode.toUpperCase()) &&
      selectedSet.has(secondSeat.seatCode.toUpperCase())
    ) {
      return {
        side: 'left',
        seatLabel: firstSeat.label || firstSeat.seatCode,
        message: buildEdgeSeatConflictMessage(firstSeat.label || firstSeat.seatCode),
      };
    }

    const lastSeat = sortedSeats[sortedSeats.length - 1];
    const beforeLastSeat = sortedSeats[sortedSeats.length - 2];

    if (
      lastSeat.status === SHOWTIME_SEAT_STATUS.AVAILABLE &&
      !selectedSet.has(lastSeat.seatCode.toUpperCase()) &&
      selectedSet.has(beforeLastSeat.seatCode.toUpperCase())
    ) {
      return {
        side: 'right',
        seatLabel: lastSeat.label || lastSeat.seatCode,
        message: buildEdgeSeatConflictMessage(lastSeat.label || lastSeat.seatCode),
      };
    }
  }

  return null;
};

const getSeatPrice = (seatType, basePrice, capacity = 1) => {
  const normalizedType = String(seatType).trim().toLowerCase();
  if (normalizedType === 'vip') {
    return basePrice + 30000;
  }
  if (normalizedType === 'couple') {
    return basePrice * Math.max(capacity, 1);
  }
  return basePrice;
};

const getEffectivePaymentStatus = (booking) => {
  if (booking.paymentStatus === PAYMENT_STATUS.SUCCESS || booking.paidAt) {
    return PAYMENT_STATUS.SUCCESS;
  }
  if (
    booking.paymentStatus === PAYMENT_STATUS.PENDING &&
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
  user: sanitizeUserSummary(booking.userId),
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
        roomType: booking.roomId.roomType,
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
    seatCode: seat.seatCode,
    seatLabel: getSeatDisplayLabel(seat),
    seatType: seat.seatType,
    status: seat.status,
    price: seat.price,
    coupleGroupId: seat.coupleGroupId,
  })),
});

const markBookingTransactionsAsExpired = async (bookingIds) => {
  if (!Array.isArray(bookingIds) || bookingIds.length === 0) return;

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
      seatState.bookedAt = null;
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
          status: BOOKING_STATUS.EXPIRED,
          paymentStatus: PAYMENT_STATUS.EXPIRED,
        },
      }
    ).exec();

    await markBookingTransactionsAsExpired(bookingIds);
  }
};

const assertShowtimeIsBookable = (showtime) => {
  if (showtime.status === 'locked') {
    throw ApiError.conflict('Suất chiếu này đã bị khóa bán vé', 'SHOWTIME_LOCKED');
  }
  if (new Date(showtime.startTime).getTime() <= Date.now()) {
    throw ApiError.conflict('Suất chiếu này đã bắt đầu', 'SHOWTIME_ALREADY_STARTED');
  }
};

const createBooking = async ({ userId, showtimeId, seatCodes, seatCoordinates }) => {
  const showtime = await Showtime.findById(showtimeId)
    .populate('movieId')
    .populate('cinemaId')
    .populate('roomId')
    .exec();

  if (!showtime) throw ApiError.notFound('Showtime not found', 'SHOWTIME_NOT_FOUND');

  assertShowtimeIsBookable(showtime);
  await cleanupExpiredHeldSeats(showtime);

  const seatStateMap = new Map(showtime.seatStates.map(s => [s.seatCode.toUpperCase(), s]));
  
  // Prioritize seatCodes, fallback to seatCoordinates for backward compatibility
  const finalCodes = seatCodes || seatCoordinates;
  if (!Array.isArray(finalCodes) || finalCodes.length === 0) {
    throw ApiError.badRequest('Danh sách ghế (seatCodes) là bắt buộc', 'SEAT_CODES_REQUIRED');
  }

  const normalizedCoords = finalCodes.map(c => c.trim().toUpperCase());

  // 1. Basic validation
  normalizedCoords.forEach(code => {
    const state = seatStateMap.get(code);
    if (!state) throw ApiError.badRequest(`Ghế ${code} không tồn tại`, 'INVALID_SEAT');
    
    // Check sellable type
    if ([SEAT_TYPE.EMPTY, SEAT_TYPE.AISLE, SEAT_TYPE.DISABLED].includes(state.type)) {
      throw ApiError.badRequest(`Không thể đặt loại ghế này: ${state.type} (${code})`, 'INVALID_SEAT_TYPE');
    }
    
    // Check status
    if (state.status !== SHOWTIME_SEAT_STATUS.AVAILABLE) {
      throw ApiError.conflict(`Ghế ${state.label || code} hiện không khả dụng (đã bán hoặc đang giữ)`, 'SEAT_NOT_AVAILABLE');
    }
  });

  // 2. Couple Seat Validation
  const selectedSet = new Set(normalizedCoords);
  normalizedCoords.forEach(code => {
    const state = seatStateMap.get(code);
    if (state.type === SEAT_TYPE.COUPLE && state.coupleGroupId) {
      // Find all seats in the same couple group
      const peerSeats = showtime.seatStates.filter(s => s.coupleGroupId === state.coupleGroupId);
      peerSeats.forEach(peer => {
        if (!selectedSet.has(peer.seatCode.toUpperCase())) {
          throw ApiError.badRequest(
            `Ghế đôi ${state.label} phải được đặt cùng với ghế ${peer.label}`,
            'COUPLE_SEAT_INCOMPLETE'
          );
        }
      });
    }
  });

  // 3. Edge Seat Conflict Validation
  const edgeConflict = getEdgeSeatSelectionConflict({
    seatStates: showtime.seatStates,
    selectedCoordinates: normalizedCoords,
  });
  if (edgeConflict) throw ApiError.badRequest(edgeConflict.message, 'EDGE_SEAT_CONFLICT');

  // 4. Create Booking
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.bookingHoldTtlMinutes * 60 * 1000);

  const bookingSeats = normalizedCoords.map(code => {
    const state = seatStateMap.get(code);
    return {
      seatCode: state.seatCode,
      seatLabel: getSeatDisplayLabel(state),
      seatType: state.type,
      status: BOOKED_SEAT_STATUS.PENDING_PAYMENT,
      price: getSeatPrice(state.type, showtime.price, state.capacity || 1),
      coupleGroupId: state.coupleGroupId,
    };
  });

  const booking = new Booking({
    _id: new mongoose.Types.ObjectId(),
    userId,
    movieId: showtime.movieId._id,
    showtimeId: showtime._id,
    roomId: showtime.roomId._id,
    seats: bookingSeats,
    totalAmount: bookingSeats.reduce((sum, s) => sum + s.price, 0),
    status: BOOKING_STATUS.PENDING_PAYMENT,
    paymentStatus: PAYMENT_STATUS.PENDING,
    currency: env.paymentCurrency,
    paymentExpiresAt: expiresAt,
  });

  // 5. Update Showtime Seat States
  normalizedCoords.forEach(code => {
    const state = seatStateMap.get(code);
    state.status = SHOWTIME_SEAT_STATUS.HELD;
    state.userId = userId;
    state.bookingId = booking._id;
    state.heldAt = now;
    state.holdExpiresAt = expiresAt;
  });

  await Promise.all([booking.save(), showtime.save()]);

  const freshBooking = await getOwnedBookingOrThrow(booking._id, userId);
  return mapBookingResponse(freshBooking);
};

const listMyBookings = async ({ userId, status, paymentStatus }) => {
  const filter = { userId };
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const [items, total] = await Promise.all([
    getBookingQuery(filter).lean().exec(),
    Booking.countDocuments(filter),
  ]);

  return { items: items.map(mapBookingResponse), total };
};

const getMyBookingById = async ({ bookingId, userId }) => {
  const booking = await getOwnedBookingOrThrow(bookingId, userId);
  return mapBookingResponse(booking);
};

const cancelBooking = async ({ bookingId, userId }) => {
  const booking = await getOwnedBookingOrThrow(bookingId, userId);

  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    throw ApiError.conflict('Không thể hủy đơn hàng đã thanh toán', 'BOOKING_ALREADY_CONFIRMED');
  }

  const showtime = await Showtime.findById(booking.showtimeId).exec();
  if (showtime) {
    const seatCodes = new Set(booking.seats.map(s => s.seatCode.toUpperCase()));
    showtime.seatStates.forEach(state => {
      if (seatCodes.has(state.seatCode.toUpperCase()) && String(state.bookingId) === String(booking._id)) {
        state.status = SHOWTIME_SEAT_STATUS.AVAILABLE;
        state.userId = null;
        state.bookingId = null;
        state.heldAt = null;
        state.holdExpiresAt = null;
      }
    });
    await showtime.save();
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.paymentStatus = PAYMENT_STATUS.FAILED;
  booking.paymentExpiresAt = null;

  await Promise.all([
    booking.save(),
    markBookingTransactionsAsExpired([booking._id]),
  ]);

  const freshBooking = await getOwnedBookingOrThrow(booking._id, userId);
  return mapBookingResponse(freshBooking);
};

const listBookingsAdmin = async (filter) => {
  const query = {};
  if (filter.status) query.status = filter.status;
  if (filter.paymentStatus) query.paymentStatus = filter.paymentStatus;
  if (filter.bookingCode) query.bookingCode = { $regex: filter.bookingCode, $options: 'i' };
  
  const [items, total] = await Promise.all([
    getBookingQuery(query).lean().exec(),
    Booking.countDocuments(query),
  ]);

  return { items: items.map(mapBookingResponse), total };
};

const getBookingByIdAdmin = async (bookingId) => {
  const booking = await getBookingQuery({ _id: bookingId }).lean().then(i => i[0]);
  if (!booking) throw ApiError.notFound('Booking not found');
  return mapBookingResponse(booking);
};

const cancelBookingAdmin = async (bookingId) => {
  const booking = await Booking.findById(bookingId).exec();
  if (!booking) throw ApiError.notFound('Booking not found');
  
  // Logic tương tự cancelBooking nhưng không check userId
  const showtime = await Showtime.findById(booking.showtimeId).exec();
  if (showtime) {
    const seatCodes = new Set(booking.seats.map(s => s.seatCode.toUpperCase()));
    showtime.seatStates.forEach(state => {
      if (seatCodes.has(state.seatCode.toUpperCase()) && String(state.bookingId) === String(booking._id)) {
        state.status = SHOWTIME_SEAT_STATUS.AVAILABLE;
        state.userId = null;
        state.bookingId = null;
        state.heldAt = null;
        state.holdExpiresAt = null;
      }
    });
    await showtime.save();
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.paymentStatus = PAYMENT_STATUS.FAILED;
  await booking.save();
  await markBookingTransactionsAsExpired([booking._id]);
  
  const freshBooking = await getBookingQuery({ _id: bookingId }).limit(1).then(i => i[0] || null);
  if (!freshBooking) throw ApiError.notFound('Booking not found');
  return mapBookingResponse(freshBooking);
};

const checkAndExpireBooking = async (booking) => {
  if (
    booking.status === BOOKING_STATUS.PENDING_PAYMENT &&
    booking.paymentExpiresAt &&
    new Date(booking.paymentExpiresAt).getTime() <= Date.now()
  ) {
    const showtime = await Showtime.findById(booking.showtimeId).exec();
    if (showtime) {
      const bookingSeatCodes = new Set(booking.seats.map((s) => s.seatCode.toUpperCase()));
      showtime.seatStates.forEach((seatState) => {
        if (
          bookingSeatCodes.has(seatState.seatCode.toUpperCase()) &&
          seatState.status === SHOWTIME_SEAT_STATUS.HELD &&
          String(seatState.bookingId) === String(booking._id)
        ) {
          seatState.status = SHOWTIME_SEAT_STATUS.AVAILABLE;
          seatState.userId = null;
          seatState.bookingId = null;
          seatState.heldAt = null;
          seatState.holdExpiresAt = null;
        }
      });
      await showtime.save();
    }

    booking.status = BOOKING_STATUS.EXPIRED;
    booking.paymentStatus = PAYMENT_STATUS.EXPIRED;
    booking.paymentExpiresAt = null;
    await booking.save();

    await PaymentTransaction.updateMany(
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
          status: PAYMENT_TRANSACTION_STATUS.EXPIRED,
          failureReason: 'Booking payment window expired',
        },
      }
    ).exec();
  }
};

const getResumablePaymentData = async (booking) => {
  const transaction = await PaymentTransaction.findOne({ bookingId: booking._id })
    .sort({ createdAt: -1 })
    .exec();

  const now = Date.now();
  const holdExpiresAt = booking.paymentExpiresAt;
  const remainingSeconds = holdExpiresAt
    ? Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - now) / 1000))
    : 0;

  const populated = await Booking.findById(booking._id)
    .populate('movieId')
    .populate('roomId')
    .populate({
      path: 'showtimeId',
      populate: {
        path: 'cinemaId',
      },
    })
    .exec();

  return {
    bookingId: String(booking._id),
    paymentTransactionId: transaction ? transaction.paymentId : null,
    status: booking.status,
    paymentStatus: getEffectivePaymentStatus(booking),
    qrCode: transaction ? transaction.paymentUrl : null,
    amount: booking.totalAmount,
    holdExpiresAt,
    remainingSeconds,
    seats: booking.seats.map((s) => ({
      seatCode: s.seatCode,
      seatLabel: getSeatDisplayLabel(s),
      seatType: s.seatType,
      status: s.status,
      price: s.price,
      coupleGroupId: s.coupleGroupId,
    })),
    movie: populated.movieId
      ? {
          id: String(populated.movieId._id),
          title: populated.movieId.title,
          duration: populated.movieId.duration,
          poster: populated.movieId.poster,
          status: populated.movieId.status,
        }
      : null,
    cinema: populated.showtimeId?.cinemaId
      ? {
          id: String(populated.showtimeId.cinemaId._id),
          name: populated.showtimeId.cinemaId.name,
          brand: populated.showtimeId.cinemaId.brand,
          city: populated.showtimeId.cinemaId.city,
          address: populated.showtimeId.cinemaId.address,
        }
      : null,
    room: populated.roomId
      ? {
          id: String(populated.roomId._id),
          name: populated.roomId.name,
          roomType: populated.roomId.roomType,
          totalRows: populated.roomId.totalRows,
          totalColumns: populated.roomId.totalColumns,
        }
      : null,
    showtime: populated.showtimeId
      ? {
          id: String(populated.showtimeId._id),
          startTime: populated.showtimeId.startTime,
          endTime: populated.showtimeId.endTime,
        }
      : null,
  };
};

const getBookingPaymentStatus = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, userId }).exec();
  if (!booking) {
    throw ApiError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
  }

  await checkAndExpireBooking(booking);

  return getResumablePaymentData(booking);
};

const getPendingBookingMe = async (userId) => {
  let booking = await Booking.findOne({
    userId,
    status: BOOKING_STATUS.PENDING_PAYMENT,
    paymentStatus: PAYMENT_STATUS.PENDING,
    paymentExpiresAt: { $gt: new Date() },
  }).exec();

  if (!booking) {
    return null;
  }

  return getResumablePaymentData(booking);
};

module.exports = {
  createBooking,
  listMyBookings,
  getMyBookingById,
  cancelBooking,
  listBookingsAdmin,
  getBookingByIdAdmin,
  cancelBookingAdmin,
  getBookingPaymentStatus,
  getPendingBookingMe,
  _private: {
    mapBookingResponse,
  },
};
