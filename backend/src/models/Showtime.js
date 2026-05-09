const mongoose = require("mongoose");

const { SHOWTIME_SEAT_STATUS, SEAT_TYPE } = require("../constants/payment.constants");

const ShowtimeSeatStateSchema = new mongoose.Schema(
  {
    // Snapshot info from Room layout
    seatCode: {
      type: String,
      required: [true, "Mã ghế là bắt buộc"],
      trim: true,
      uppercase: true,
    },
    label: {
      type: String,
      trim: true,
      uppercase: true,
    },
    rowLabel: {
      type: String,
      trim: true,
      uppercase: true,
    },
    rowIndex: {
      type: Number,
    },
    columnIndex: {
      type: Number,
    },
    type: {
      type: String,
      enum: Object.values(SEAT_TYPE),
    },
    capacity: {
      type: Number,
      default: 1,
    },
    coupleGroupId: {
      type: String,
      default: null,
    },

    // Booking state
    status: {
      type: String,
      enum: {
        values: Object.values(SHOWTIME_SEAT_STATUS),
        message: "Trạng thái ghế không hợp lệ: {VALUE}",
      },
      default: SHOWTIME_SEAT_STATUS.AVAILABLE,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    heldAt: {
      type: Date,
      default: null,
    },
    holdExpiresAt: {
      type: Date,
      default: null,
    },
    bookedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const ShowtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Phim là bắt buộc"],
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: [true, "Rạp chiếu là bắt buộc"],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Phòng chiếu là bắt buộc"],
    },
    startTime: {
      type: Date,
      required: [true, "Thời gian bắt đầu là bắt buộc"],
    },
    endTime: {
      type: Date,
      required: [true, "Thời gian kết thúc là bắt buộc"],
      validate: {
        validator: function (value) {
          return !this.startTime || !value || value > this.startTime;
        },
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      },
    },
    price: {
      type: Number,
      required: [true, "Giá vé cơ bản là bắt buộc"],
      min: [0, "Giá vé không hợp lệ"],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "locked"],
        message: "Trạng thái suất chiếu không hợp lệ: {VALUE}",
      },
      default: "active",
      index: true,
    },
    seatStates: {
      type: [ShowtimeSeatStateSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ShowtimeSchema.index({ movieId: 1, cinemaId: 1, startTime: 1 });
ShowtimeSchema.index({ roomId: 1, startTime: 1 });
ShowtimeSchema.index({ roomId: 1, "seatStates.seatCode": 1 });

module.exports = mongoose.model("Showtime", ShowtimeSchema);
