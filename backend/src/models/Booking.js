const crypto = require('crypto');
const mongoose = require('mongoose');
const {
  BOOKED_SEAT_STATUS,
  BOOKING_STATUS,
  PAYMENT_CURRENCY,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} = require('../constants/payment.constants');

const SEAT_TYPE = {
  STANDARD: 'standard',
  VIP: 'vip',
  COUPLE: 'couple',
  ACCESSIBLE: 'accessible',
};

const createBookingCode = () =>
  `BK-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized || undefined;
};

const PaymentSummarySchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      trim: true,
      required: [true, 'paymentId là bắt buộc'],
    },
    transactionCode: {
      type: String,
      trim: true,
      required: [true, 'transactionCode là bắt buộc'],
    },
    paidAmount: {
      type: Number,
      required: [true, 'paidAmount là bắt buộc'],
      min: [0, 'paidAmount không được âm'],
    },
    currency: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_CURRENCY),
        message: 'currency không hợp lệ: {VALUE}',
      },
      required: [true, 'currency là bắt buộc'],
    },
    sourceAccountNo: {
      type: String,
      trim: true,
      required: [true, 'sourceAccountNo là bắt buộc'],
    },
    receiverAccountNo: {
      type: String,
      trim: true,
      required: [true, 'receiverAccountNo là bắt buộc'],
    },
    paidAt: {
      type: Date,
      required: [true, 'paidAt là bắt buộc'],
    },
    verifiedAt: {
      type: Date,
      required: [true, 'verifiedAt là bắt buộc'],
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const BookingSeatSchema = new mongoose.Schema(
  {
    seatCoordinate: {
      type: String,
      required: [true, 'Toạ độ thật của ghế là bắt buộc'],
      trim: true,
      uppercase: true,
    },
    seatLabel: {
      type: String,
      required: [true, 'Tên ghế hiển thị là bắt buộc'],
      trim: true,
      uppercase: true,
    },
    seatType: {
      type: String,
      enum: {
        values: Object.values(SEAT_TYPE),
        message: 'Loại ghế không hợp lệ: {VALUE}',
      },
      required: [true, 'Loại ghế là bắt buộc'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(BOOKED_SEAT_STATUS),
        message: 'Trạng thái ghế trong booking không hợp lệ: {VALUE}',
      },
      default: BOOKED_SEAT_STATUS.PENDING_PAYMENT,
      required: [true, 'Trạng thái ghế là bắt buộc'],
    },
    price: {
      type: Number,
      required: [true, 'Giá ghế là bắt buộc'],
      min: [0, 'Giá ghế không được âm'],
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người đặt vé là bắt buộc'],
    },
    bookingCode: {
      type: String,
      default: createBookingCode,
      trim: true,
      unique: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Phim là bắt buộc'],
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: [true, 'Suất chiếu là bắt buộc'],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Phòng chiếu là bắt buộc'],
    },
    seats: {
      type: [BookingSeatSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Danh sách ghế phải có ít nhất 1 ghế',
      },
    },
    totalAmount: {
      type: Number,
      alias: 'totalPrice',
      required: [true, 'Tổng tiền là bắt buộc'],
      min: [0, 'Tổng tiền không được âm'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(BOOKING_STATUS),
        message: 'Trạng thái booking không hợp lệ: {VALUE}',
      },
      default: BOOKING_STATUS.PENDING_PAYMENT,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_STATUS),
        message: 'Trạng thái thanh toán không hợp lệ: {VALUE}',
      },
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: [...Object.values(PAYMENT_METHOD), null],
        message: 'Phương thức thanh toán không hợp lệ: {VALUE}',
      },
      default: null,
    },
    currency: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_CURRENCY),
        message: 'Đơn vị tiền tệ không hợp lệ: {VALUE}',
      },
      default: PAYMENT_CURRENCY.VND,
    },
    paymentExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    transactionCode: {
      type: String,
      trim: true,
      default: undefined,
      set: normalizeOptionalString,
    },
    paymentSummary: {
      type: PaymentSummarySchema,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ showtimeId: 1, status: 1 });
BookingSchema.index({ paymentStatus: 1, paymentExpiresAt: 1 });
BookingSchema.index(
  { transactionCode: 1 },
  {
    name: 'transactionCode_1',
    unique: true,
    partialFilterExpression: {
      transactionCode: { $type: 'string' },
    },
  }
);

module.exports = mongoose.model('Booking', BookingSchema);
