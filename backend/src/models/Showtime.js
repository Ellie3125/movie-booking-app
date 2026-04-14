const mongoose = require("mongoose");

const HeldSeatSchema = new mongoose.Schema(
  {
    seatCode: {
      type: String,
      required: [true, "Mã ghế giữ chỗ là bắt buộc"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người giữ chỗ là bắt buộc"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Thời gian hết hạn giữ chỗ là bắt buộc"],
    },
  },
  {
    _id: false,
    versionKey: false,
  },
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
    bookedSeats: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
    heldSeats: {
      type: [HeldSeatSchema],
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

module.exports = mongoose.model("Showtime", ShowtimeSchema);
