const mongoose = require("mongoose");

const MOVIE_STATUS = {
  NOW_SHOWING: "now_showing",
  COMING_SOON: "coming_soon",
  ENDED: "ended",
};

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tên phim là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Thời lượng phim là bắt buộc"],
      min: [1, "Thời lượng phim phải lớn hơn 0"],
    },
    genre: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    poster: {
      type: String,
      default: "",
      trim: true,
    },
    releaseDate: {
      type: Date,
      required: [true, "Ngày phát hành là bắt buộc"],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(MOVIE_STATUS),
        message: "Trạng thái không hợp lệ: {VALUE}",
      },
      default: MOVIE_STATUS.COMING_SOON,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

MovieSchema.index({ title: "text" });
MovieSchema.index({ releaseDate: -1 });

module.exports = mongoose.model("Movie", MovieSchema);
