const mongoose = require("mongoose");

const BOOKING_STATUS = {
  HELD: "held",
  PAID: "paid",
  CANCELLED: "cancelled",
};

const PAYMENT_METHOD = {
  CASH: "cash",
  MOMO_SANDBOX: "momo_sandbox",
  VNPAY_SANDBOX: "vnpay_sandbox",
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
    paymentMethod: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_METHOD),
        message: "Phương thức thanh toán không hợp lệ: {VALUE}",
      },
      default: PAYMENT_METHOD.CASH,
    },
    paidAt: {
      type: Date,
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

module.exports = mongoose.model("Booking", BookingSchema);
