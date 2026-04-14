const mongoose = require("mongoose");

const SEAT_CELL_TYPE = {
  SEAT: "seat",
  EMPTY: "empty",
};

const SEAT_TYPE = {
  STANDARD: "standard",
  VIP: "vip",
  COUPLE: "couple",
};

const SeatCellSchema = new mongoose.Schema(
  {
    cellType: {
      type: String,
      enum: {
        values: Object.values(SEAT_CELL_TYPE),
        message: "Loại ô ghế không hợp lệ: {VALUE}",
      },
      required: [true, "Loại ô ghế là bắt buộc"],
    },
    seatCode: {
      type: String,
      trim: true,
      default: null,
      required: function () {
        return this.cellType === SEAT_CELL_TYPE.SEAT;
      },
    },
    seatType: {
      type: String,
      enum: {
        values: [...Object.values(SEAT_TYPE), null],
        message: "Loại ghế không hợp lệ: {VALUE}",
      },
      default: null,
      required: function () {
        return this.cellType === SEAT_CELL_TYPE.SEAT;
      },
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const RoomSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: [true, "Rạp chiếu là bắt buộc"],
    },
    name: {
      type: String,
      required: [true, "Tên phòng chiếu là bắt buộc"],
      trim: true,
    },
    screenLabel: {
      type: String,
      default: "M\u00c0N H\u00ccNH",
      trim: true,
    },
    totalColumns: {
      type: Number,
      required: [true, "Tổng số cột là bắt buộc"],
      min: [1, "Tổng số cột phải lớn hơn 0"],
    },
    seatLayout: {
      type: [[SeatCellSchema]],
      required: [true, "Sơ đồ ghế là bắt buộc"],
      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every(
              (row) =>
                Array.isArray(row) &&
                row.length > 0 &&
                row.length === this.totalColumns,
            )
          );
        },
        message:
          "Sơ đồ ghế phải có dữ liệu và mỗi hàng phải khớp tổng số cột",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

RoomSchema.index({ cinemaId: 1, name: 1 });

module.exports = mongoose.model("Room", RoomSchema);
