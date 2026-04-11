const mongoose = require("mongoose");

const CinemaSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      enum: ["CGV", "Beta", "Lotte"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      enum: ["Hà Nội", "TP Hồ Chí Minh", "Đà Nẵng"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cinema", CinemaSchema);
