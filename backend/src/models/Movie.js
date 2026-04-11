const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      required: true,
    },
    genre: [
      {
        type: String,
        trim: true,
      },
    ],
    poster: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["now_showing", "coming_soon"],
      default: "now_showing",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Movie", MovieSchema);
