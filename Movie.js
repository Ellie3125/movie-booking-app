const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tên phim là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      required: [true, "Thời lượng phim là bắt buộc"],
      min: [1, "Thời lượng phim phải lớn hơn 0"],
    },
    genre: {
      type: [String],
      default: [],
    },
    poster: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: Date,
      required: [true, "Ngày phát hành là bắt buộc"],
    },
    status: {
      type: String,
      enum: {
        values: ["now_showing", "coming_soon", "ended"],
        message: "Trạng thái không hợp lệ: {VALUE}",
      },
      default: "coming_soon",
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh theo title và status
movieSchema.index({ title: "text" });
movieSchema.index({ status: 1 });
movieSchema.index({ releaseDate: -1 });

module.exports = mongoose.model("Movie", movieSchema);
