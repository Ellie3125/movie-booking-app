const mongoose = require("mongoose");

const CinemaBrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên thương hiệu là bắt buộc"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Mã thương hiệu là bắt buộc"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    logo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("CinemaBrand", CinemaBrandSchema);
