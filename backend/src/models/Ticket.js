const mongoose = require("mongoose");

const TICKET_STATUS = {
  ACTIVE: "active",
  USED: "used",
  CANCELLED: "cancelled",
};

const TicketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Mã đặt vé là bắt buộc"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người dùng là bắt buộc"],
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
    seatCode: {
      type: String,
      required: [true, "Mã ghế là bắt buộc"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Giá vé là bắt buộc"],
      min: [0, "Giá vé không được âm"],
    },
    ticketCode: {
      type: String,
      required: [true, "Mã vé là bắt buộc"],
      trim: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TICKET_STATUS),
        message: "Trạng thái vé không hợp lệ: {VALUE}",
      },
      default: TICKET_STATUS.ACTIVE,
      index: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TicketSchema.index({ bookingId: 1, seatCode: 1 }, { unique: true });
TicketSchema.index({ userId: 1, createdAt: -1 });
TicketSchema.index({ showtimeId: 1, status: 1 });

module.exports = mongoose.model("Ticket", TicketSchema);
