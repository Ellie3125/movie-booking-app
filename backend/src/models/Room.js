const mongoose = require("mongoose");

const SeatCellSchema = new mongoose.Schema(
  {
    cellType: {
      type: String,
      enum: ["seat", "empty"],
      required: true,
    },
    seatCode: {
      type: String,
      trim: true,
      default: null,
    },
    seatType: {
      type: String,
      enum: ["standard", "vip", "couple"],
      default: null,
    },
  },
  { _id: false },
);

const RoomSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    screenLabel: {
      type: String,
      default: "MÀN HÌNH",
    },
    totalColumns: {
      type: Number,
      required: true,
    },
    seatLayout: {
      type: [[SeatCellSchema]],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Room", RoomSchema);
