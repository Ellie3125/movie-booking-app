const mongoose = require("mongoose");
const { CINEMA_BRANDS, VIETNAM_PROVINCES } = require("../constants/cinema.constants");

const CinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên rạp là bắt buộc"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Thương hiệu rạp là bắt buộc"],
      enum: {
        values: CINEMA_BRANDS.map(b => b.code),
        message: "Thương hiệu không hợp lệ: {VALUE}",
      },
      index: true,
    },
    province: {
      type: String,
      required: [true, "Tỉnh/Thành phố là bắt buộc"],
      enum: {
        values: VIETNAM_PROVINCES,
        message: "Tỉnh/Thành phố không hợp lệ: {VALUE}",
      },
      index: true,
    },
    address: {
      type: String,
      required: [true, "Địa chỉ là bắt buộc"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CinemaSchema.index({ province: 1, brand: 1, name: 1 });

module.exports = mongoose.model("Cinema", CinemaSchema);
