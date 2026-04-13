const mongoose = require("mongoose");

const BOOKING_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
};

const PAYMENT_METHOD = {
  CASH: "cash",
  MOMO_SANDBOX: "momo_sandbox",
  VNPAY_SANDBOX: "vnpay_sandbox",
};

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
    seatCodes: {
      type: [
        {
          type: String,
          required: [true, "Mã ghế là bắt buộc"],
          trim: true,
        },
      ],
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
      default: BOOKING_STATUS.PENDING,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ showtimeId: 1, status: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
