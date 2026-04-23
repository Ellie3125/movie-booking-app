const mongoose = require("mongoose");

const SEAT_CELL_TYPE = {
  SEAT: "seat",
  EMPTY: "empty",
};

const SEAT_TYPE = {
  STANDARD: "standard",
  COUPLE: "couple",
};

const SeatCoordinateSchema = new mongoose.Schema(
  {
    rowIndex: {
      type: Number,
      required: [true, "Chỉ số hàng là bắt buộc"],
      min: [0, "Chỉ số hàng không hợp lệ"],
    },
    columnIndex: {
      type: Number,
      required: [true, "Chỉ số cột là bắt buộc"],
      min: [0, "Chỉ số cột không hợp lệ"],
    },
    coordinateLabel: {
      type: String,
      required: [true, "Toạ độ thật của ô ghế là bắt buộc"],
      trim: true,
      uppercase: true,
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

const RoomSeatSchema = new mongoose.Schema(
  {
    cellType: {
      type: String,
      enum: {
        values: Object.values(SEAT_CELL_TYPE),
        message: "Loại ô ghế không hợp lệ: {VALUE}",
      },
      required: [true, "Loại ô ghế là bắt buộc"],
    },
    coordinate: {
      type: SeatCoordinateSchema,
      required: [true, "Toạ độ ô ghế là bắt buộc"],
    },
    seatLabel: {
      type: String,
      trim: true,
      uppercase: true,
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
    priceModifier: {
      type: Number,
      default: 1,
      min: [0, "Hệ số giá ghế không hợp lệ"],
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
      default: "MÀN HÌNH",
      trim: true,
    },
    totalRows: {
      type: Number,
      required: [true, "Tổng số hàng là bắt buộc"],
      min: [1, "Tổng số hàng phải lớn hơn 0"],
    },
    totalColumns: {
      type: Number,
      required: [true, "Tổng số cột là bắt buộc"],
      min: [1, "Tổng số cột phải lớn hơn 0"],
    },
    activeSeatCount: {
      type: Number,
      default: 0,
      min: [0, "Số ghế khả dụng không hợp lệ"],
    },
    seatLayout: {
      type: [[RoomSeatSchema]],
      required: [true, "Sơ đồ ghế là bắt buộc"],
      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length === this.totalRows &&
            value.every(
              (row) =>
                Array.isArray(row) &&
                row.length === this.totalColumns &&
                row.every(
                  (cell) =>
                    cell &&
                    cell.coordinate &&
                    typeof cell.coordinate.coordinateLabel === "string",
                ),
            )
          );
        },
        message:
          "Sơ đồ ghế phải khớp tổng số hàng/cột và từng ô phải có toạ độ thật",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

RoomSchema.pre("validate", function () {
  if (Array.isArray(this.seatLayout)) {
    this.activeSeatCount = this.seatLayout
      .flat()
      .filter((cell) => cell && cell.cellType === SEAT_CELL_TYPE.SEAT).length;
  }

});

RoomSchema.index({ cinemaId: 1, name: 1 });

module.exports = mongoose.model("Room", RoomSchema);
