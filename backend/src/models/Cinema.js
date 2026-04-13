const mongoose = require("mongoose");

const CINEMA_BRAND = {
  CGV: "CGV",
  BETA: "Beta",
  LOTTE: "Lotte",
};

const CINEMA_CITY = {
  HA_NOI: "Hà Nội",
  HO_CHI_MINH: "TP Hồ Chí Minh",
  DA_NANG: "Đà Nẵng",
};


const CinemaSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, "Thương hiệu rạp là bắt buộc"],
      enum: {
        values: Object.values(CINEMA_BRAND),
        message: "Thương hiệu rạp không hợp lệ: {VALUE}",
      },
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tên rạp là bắt buộc"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "Thành phố là bắt buộc"],
      enum: {
        values: Object.values(CINEMA_CITY),
        message: "Thành phố không hợp lệ: {VALUE}",
      },
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, "Địa chỉ là bắt buộc"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

CinemaSchema.index({ city: 1, brand: 1, name: 1 });

module.exports = mongoose.model("Cinema", CinemaSchema);
