const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");

const {
  User,
  Movie,
  Cinema,
  Room,
  Showtime,
  Booking,
  Ticket,
  Session,
} = require("../src/models");

const MONGODB_URI = process.env.MONGODB_URI;

const destroy = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("Thiếu cấu hình MONGODB_URI");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected for destroy");

    await Promise.all([
      Session.deleteMany({}),
      Ticket.deleteMany({}),
      Booking.deleteMany({}),
      Showtime.deleteMany({}),
      Room.deleteMany({}),
      Cinema.deleteMany({}),
      Movie.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log("All seed data deleted successfully");
  } catch (error) {
    console.error("Destroy failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

destroy();
