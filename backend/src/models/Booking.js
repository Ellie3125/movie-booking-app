const crypto = require("crypto");
const mongoose = require("mongoose");

const BOOKING_STATUS = {
  HELD: "held",
  PAID: "paid",
  CANCELLED: "cancelled",
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  EXPIRED: "expired",
};

const PAYMENT_METHOD = {
  CASH: "cash",
  MOMO_SANDBOX: "momo_sandbox",
  VNPAY_SANDBOX: "vnpay_sandbox",
};

const PAYMENT_CURRENCY = {
  VND: "VND",
};

const SEAT_TYPE = {
  STANDARD: "standard",
  VIP: "vip",
  COUPLE: "couple",
  ACCESSIBLE: "accessible",
};

const BOOKED_SEAT_STATUS = {
  HELD: "held",
  PAID: "paid",
};

const createBookingCode = () =>
  `BK-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

const PaymentSnapshotSchema = new mongoose.Schema(
  {
    paidAmount: {
      type: Number,
      required: [true, "Số tiền thanh toán là bắt buộc"],
      min: [0, "Số tiền thanh toán không được âm"],
    },
    currency: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_CURRENCY),
        message: "Đơn vị tiền tệ không hợp lệ: {VALUE}",
      },
      required: [true, "Đơn vị tiền tệ là bắt buộc"],
    },
    timestamp: {
      type: Number,
      required: [true, "Timestamp thanh toán là bắt buộc"],
      min: [1, "Timestamp thanh toán không hợp lệ"],
    },
    signature: {
      type: String,
      required: [true, "Chữ ký thanh toán là bắt buộc"],
      trim: true,
    },
    verifiedAt: {
      type: Date,
      required: [true, "Thời gian xác thực thanh toán là bắt buộc"],
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const BookingSeatSchema = new mongoose.Schema(
  {
    seatCoordinate: {
      type: String,
      required: [true, "Toạ độ thật của ghế là bắt buộc"],
      trim: true,
      uppercase: true,
    },
    seatLabel: {
      type: String,
      required: [true, "Tên ghế hiển thị là bắt buộc"],
      trim: true,
      uppercase: true,
    },
    seatType: {
      type: String,
      enum: {
        values: Object.values(SEAT_TYPE),
        message: "Loại ghế không hợp lệ: {VALUE}",
      },
      required: [true, "Loại ghế là bắt buộc"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(BOOKED_SEAT_STATUS),
        message: "Trạng thái ghế trong booking không hợp lệ: {VALUE}",
      },
      required: [true, "Trạng thái ghế là bắt buộc"],
    },
    price: {
      type: Number,
      required: [true, "Giá ghế là bắt buộc"],
      min: [0, "Giá ghế không được âm"],
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người đặt vé là bắt buộc"],
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
      ref: "Movie",
      required: [true, "Phim là bắt buộc"],
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: [true, "Suất chiếu là bắt buộc"],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Phòng chiếu là bắt buộc"],
    },
    seats: {
      type: [BookingSeatSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Danh sách ghế phải có ít nhất 1 ghế",
      },
    },
    totalPrice: {
      type: Number,
      required: [true, "Tổng tiền là bắt buộc"],
      min: [0, "Tổng tiền không được âm"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(BOOKING_STATUS),
        message: "Trạng thái đặt vé không hợp lệ: {VALUE}",
      },
      default: BOOKING_STATUS.HELD,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_STATUS),
        message: "Trạng thái thanh toán không hợp lệ: {VALUE}",
      },
      default: function () {
        return this.status === BOOKING_STATUS.PAID || this.paidAt
          ? PAYMENT_STATUS.PAID
          : PAYMENT_STATUS.PENDING;
      },
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: [...Object.values(PAYMENT_METHOD), null],
        message: "Phương thức thanh toán không hợp lệ: {VALUE}",
      },
      default: null,
    },
    currency: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_CURRENCY),
        message: "Đơn vị tiền tệ không hợp lệ: {VALUE}",
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
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    paymentSnapshot: {
      type: PaymentSnapshotSchema,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ showtimeId: 1, status: 1 });
BookingSchema.index({ paymentStatus: 1, paymentExpiresAt: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
