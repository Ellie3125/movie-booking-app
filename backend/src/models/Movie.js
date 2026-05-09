const mongoose = require("mongoose");
const { MOVIE_GENRES } = require("../constants/movie.constants");

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
    genres: {
      type: [String],
      enum: {
        values: MOVIE_GENRES,
        message: "Thể loại không hợp lệ: {VALUE}",
      },
      default: [],
    },
    posterUrl: {
      type: String,
      default: "",
      trim: true,
    },
    backdropUrl: {
      type: String,
      default: "",
      trim: true,
    },
    releaseDate: {
      type: Date,
      required: [true, "Ngày bắt đầu chiếu là bắt buộc"],
    },
    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc chiếu là bắt buộc"],
    },
    trailerUrl: {
      type: String,
      default: "",
      trim: true,
    },
    trailerProvider: {
      type: String,
      default: "youtube",
      trim: true,
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
    language: {
      type: String,
      default: "Phụ đề",
      trim: true,
    },
    rating: {
      type: String,
      default: "T13",
      trim: true,
    },
    formats: {
      type: [{ type: String, trim: true }],
      default: ["2D"],
    },
    featuredNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

MovieSchema.index(
  { title: "text" },
  {
    default_language: "none",
    language_override: "textSearchLanguage",
  },
);

MovieSchema.index({ releaseDate: -1 });

module.exports = mongoose.model("Movie", MovieSchema);