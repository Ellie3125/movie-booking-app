const mongoose = require("mongoose");

const SEAT_TYPE = {
  REGULAR: "regular",
  VIP: "vip",
  COUPLE: "couple",
  EMPTY: "empty",
  AISLE: "aisle",
  DISABLED: "disabled",
};

const SEAT_STATUS = {
  ACTIVE: "active",
  DISABLED: "disabled",
};

const RoomSeatSchema = new mongoose.Schema(
  {
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
    seatCode: {
      type: String,
      required: [true, "Mã ghế (vị trí sơ đồ) là bắt buộc"],
      trim: true,
      uppercase: true,
    },
    rowIndex: {
      type: Number,
      required: [true, "Chỉ số hàng là bắt buộc"],
    },
    columnIndex: {
      type: Number,
      required: [true, "Chỉ số cột là bắt buộc"],
    },
    type: {
      type: String,
      enum: {
        values: Object.values(SEAT_TYPE),
        message: "Loại ghế không hợp lệ: {VALUE}",
      },
      default: SEAT_TYPE.REGULAR,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(SEAT_STATUS),
        message: "Trạng thái ghế không hợp lệ: {VALUE}",
      },
      default: SEAT_STATUS.ACTIVE,
    },
    priceType: {
      type: String,
      enum: ["regular", "vip", "couple"],
      default: "regular",
    },
    capacity: {
      type: Number,
      default: 1,
    },
    size: {
      type: Number,
      default: 1,
    },
    coupleGroupId: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const RoomRowSchema = new mongoose.Schema(
  {
    rowLabel: {
      type: String,
      required: [true, "Nhãn hàng là bắt buộc"],
      trim: true,
      uppercase: true,
    },
    seats: [RoomSeatSchema],
  },
  {
    _id: false,
    versionKey: false,
  }
);

const ROOM_TYPE = {
  STANDARD: "standard",
  VIP: "vip",
  IMAX: "imax",
  COUPLE: "couple",
};

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
    roomType: {
      type: String,
      enum: {
        values: Object.values(ROOM_TYPE),
        message: "Loại phòng không hợp lệ: {VALUE}",
      },
      default: ROOM_TYPE.STANDARD,
    },
    totalRows: {
      type: Number,
      default: 0,
    },
    totalColumns: {
      type: Number,
      default: 0,
    },
    activeSeatCount: {
      type: Number,
      default: 0,
    },
    seatLayout: [RoomRowSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

RoomSchema.pre("save", function (next) {
  if (this.seatLayout && Array.isArray(this.seatLayout)) {
    this.totalRows = this.seatLayout.length;
    
    let maxCols = 0;
    let count = 0;
    
    this.seatLayout.forEach(row => {
      if (row.seats.length > maxCols) {
        maxCols = row.seats.length;
      }
      row.seats.forEach(seat => {
        // activeSeatCount logic:
        // - regular, vip, couple: add capacity if active
        // - empty, aisle, disabled: NOT counted
        const isSellable = [SEAT_TYPE.REGULAR, SEAT_TYPE.VIP, SEAT_TYPE.COUPLE].includes(seat.type);
        if (seat.status === SEAT_STATUS.ACTIVE && isSellable) {
          count += (seat.capacity || 0);
        }
      });
    });
    
    this.totalColumns = maxCols;
    this.activeSeatCount = count;
  }
  next();
});

RoomSchema.index({ cinemaId: 1, name: 1 });

module.exports = mongoose.model("Room", RoomSchema);

