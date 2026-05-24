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
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — GeoJSON: lng trước, lat sau
        validate: {
          validator: (v) =>
            !v ||
            v.length === 0 ||
            (v.length === 2 &&
              v[0] >= -180 && v[0] <= 180 &&
              v[1] >= -90  && v[1] <= 90),
          message: "Toạ độ không hợp lệ. Định dạng: [longitude, latitude]",
        },
      },
    },
    placeId: {
      type: String,
      trim: true,
      sparse: true,
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
CinemaSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Cinema", CinemaSchema);
