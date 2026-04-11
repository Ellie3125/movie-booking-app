require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { User, Movie, Cinema, Room, Showtime, Booking } = require("../models");

const MONGODB_URI = process.env.MONGODB_URI;

const roomLayout = [
  [
    { cellType: "seat", seatCode: "A1", seatType: "standard" },
    { cellType: "seat", seatCode: "A2", seatType: "standard" },
    { cellType: "seat", seatCode: "A3", seatType: "standard" },
    { cellType: "seat", seatCode: "A4", seatType: "standard" },
    { cellType: "seat", seatCode: "A5", seatType: "standard" },
    { cellType: "empty" },
    { cellType: "seat", seatCode: "A6", seatType: "standard" },
    { cellType: "seat", seatCode: "A7", seatType: "standard" },
    { cellType: "seat", seatCode: "A8", seatType: "standard" },
    { cellType: "seat", seatCode: "A9", seatType: "standard" },
  ],
  [
    { cellType: "seat", seatCode: "B1", seatType: "standard" },
    { cellType: "seat", seatCode: "B2", seatType: "standard" },
    { cellType: "seat", seatCode: "B3", seatType: "vip" },
    { cellType: "seat", seatCode: "B4", seatType: "vip" },
    { cellType: "seat", seatCode: "B5", seatType: "vip" },
    { cellType: "empty" },
    { cellType: "seat", seatCode: "B6", seatType: "vip" },
    { cellType: "seat", seatCode: "B7", seatType: "vip" },
    { cellType: "seat", seatCode: "B8", seatType: "standard" },
    { cellType: "seat", seatCode: "B9", seatType: "standard" },
  ],
  [
    { cellType: "empty" },
    { cellType: "seat", seatCode: "C1", seatType: "standard" },
    { cellType: "seat", seatCode: "C2", seatType: "standard" },
    { cellType: "seat", seatCode: "C3", seatType: "standard" },
    { cellType: "seat", seatCode: "C4", seatType: "standard" },
    { cellType: "empty" },
    { cellType: "seat", seatCode: "C5", seatType: "standard" },
    { cellType: "seat", seatCode: "C6", seatType: "standard" },
    { cellType: "seat", seatCode: "C7", seatType: "couple" },
    { cellType: "empty" },
  ],
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected for seed");

    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Cinema.deleteMany({}),
      Room.deleteMany({}),
      Showtime.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    console.log("Old data deleted");

    const hashedPassword = await bcrypt.hash("123456", 10);

    const users = await User.insertMany([
      {
        name: "Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      },
      {
        name: "Nguyen Van A",
        email: "user1@gmail.com",
        password: hashedPassword,
        role: "user",
      },
    ]);

    const movies = await Movie.insertMany([
      {
        title: "Avengers: Endgame",
        description: "Biệt đội siêu anh hùng tập hợp lần cuối.",
        duration: 181,
        genre: ["Action", "Sci-Fi"],
        poster: "https://example.com/endgame.jpg",
        releaseDate: new Date("2019-04-26"),
        status: "now_showing",
      },
      {
        title: "Dune: Part Two",
        description: "Cuộc chiến quyền lực trên hành tinh cát.",
        duration: 166,
        genre: ["Sci-Fi", "Adventure"],
        poster: "https://example.com/dune2.jpg",
        releaseDate: new Date("2024-03-01"),
        status: "coming_soon",
      },
    ]);

    const cinemas = await Cinema.insertMany([
      {
        brand: "CGV",
        name: "Vincom Bà Triệu",
        city: "Hà Nội",
        address: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
      },
      {
        brand: "CGV",
        name: "Aeon Long Biên",
        city: "Hà Nội",
        address: "27 Cổ Linh, Long Biên, Hà Nội",
      },
      {
        brand: "Beta",
        name: "Mỹ Đình",
        city: "Hà Nội",
        address: "Tầng hầm B1, Golden Palace, Mễ Trì, Nam Từ Liêm, Hà Nội",
      },
      {
        brand: "Lotte",
        name: "West Lake",
        city: "Hà Nội",
        address: "272 Võ Chí Công, Tây Hồ, Hà Nội",
      },
      {
        brand: "CGV",
        name: "Hùng Vương Plaza",
        city: "TP Hồ Chí Minh",
        address: "126 Hồng Bàng, Quận 5, TP Hồ Chí Minh",
      },
      {
        brand: "Beta",
        name: "Trần Quang Khải",
        city: "TP Hồ Chí Minh",
        address: "Tầng 2 IMC, 62 Trần Quang Khải, Quận 1, TP Hồ Chí Minh",
      },
      {
        brand: "Lotte",
        name: "Gò Vấp",
        city: "TP Hồ Chí Minh",
        address: "242 Nguyễn Văn Lượng, Gò Vấp, TP Hồ Chí Minh",
      },
      {
        brand: "CGV",
        name: "Vincom Đà Nẵng",
        city: "Đà Nẵng",
        address: "910A Ngô Quyền, Sơn Trà, Đà Nẵng",
      },
      {
        brand: "Lotte",
        name: "Đà Nẵng",
        city: "Đà Nẵng",
        address: "6 Nại Nam, Hải Châu, Đà Nẵng",
      },
    ]);

    const rooms = await Room.insertMany([
      {
        cinemaId: cinemas[0]._id,
        name: "Phòng 1",
        screenLabel: "MÀN HÌNH",
        totalColumns: 10,
        seatLayout: roomLayout,
      },
    ]);

    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 3);

    const showtimes = await Showtime.insertMany([
      {
        movieId: movies[0]._id,
        cinemaId: cinemas[0]._id,
        roomId: rooms[0]._id,
        startTime,
        endTime,
        bookedSeats: ["A1", "A2"],
        heldSeats: [
          {
            seatCode: "B3",
            userId: users[1]._id,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        ],
      },
    ]);

    await Booking.insertMany([
      {
        userId: users[1]._id,
        movieId: movies[0]._id,
        showtimeId: showtimes[0]._id,
        roomId: rooms[0]._id,
        seatCodes: ["A1", "A2"],
        totalPrice: 180000,
        status: "paid",
        paymentMethod: "momo_sandbox",
      },
    ]);

    console.log("Seed data inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
