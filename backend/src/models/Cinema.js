const mongoose = require("mongoose");
const { VIETNAM_PROVINCES } = require("../constants/cinema.constants");

const CinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên rạp là bắt buộc"],
      trim: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CinemaBrand",
      required: [true, "ID Thương hiệu là bắt buộc"],
      index: true,
    },
    brand: {
      type: String,
      required: [true, "Mã thương hiệu rạp là bắt buộc"],
      trim: true,
      uppercase: true,
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
