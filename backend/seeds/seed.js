const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { User, Movie, Cinema, Room, Showtime, Booking, Ticket } = require("../src/models");

const usersData = require("./data/users.data");
const moviesData = require("./data/movies.data");
const cinemasData = require("./data/cinemas.data");
const roomsData = require("./data/rooms.data");
const showtimesData = require("./data/showtimes.data");
const bookingsData = require("./data/bookings.data");
const ticketsData = require("./data/tickets.data");

const MONGODB_URI = process.env.MONGODB_URI;

const mapInsertedByKey = (seedData, docs) =>
  Object.fromEntries(seedData.map((item, index) => [item.key, docs[index]]));

const getRequiredDoc = (lookup, key, label) => {
  const doc = lookup[key];

  if (!doc) {
    throw new Error(`Không tìm thấy ${label} với key: ${key}`);
  }

  return doc;
};

const buildShowtimeStart = (offsetDays, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const clearCollections = async () => {
  await Promise.all([
    Ticket.deleteMany({}),
    Booking.deleteMany({}),
    Showtime.deleteMany({}),
    Room.deleteMany({}),
    Cinema.deleteMany({}),
    Movie.deleteMany({}),
    User.deleteMany({}),
  ]);
};

const seedUsers = async () => {
  const passwordCache = new Map();

  const preparedUsers = await Promise.all(
    usersData.map(async ({ key, password, ...user }) => {
      if (!passwordCache.has(password)) {
        passwordCache.set(password, await bcrypt.hash(password, 10));
      }

      return {
        ...user,
        password: passwordCache.get(password),
      };
    }),
  );

  const docs = await User.insertMany(preparedUsers);
  return mapInsertedByKey(usersData, docs);
};

const seedMovies = async () => {
  const preparedMovies = moviesData.map(({ key, releaseDate, ...movie }) => ({
    ...movie,
    releaseDate: new Date(releaseDate),
  }));

  const docs = await Movie.insertMany(preparedMovies);
  return mapInsertedByKey(moviesData, docs);
};

const seedCinemas = async () => {
  const preparedCinemas = cinemasData.map(({ key, ...cinema }) => cinema);
  const docs = await Cinema.insertMany(preparedCinemas);
  return mapInsertedByKey(cinemasData, docs);
};

const seedRooms = async (cinemaLookup) => {
  const preparedRooms = roomsData.map(({ key, cinemaKey, ...room }) => ({
    ...room,
    cinemaId: getRequiredDoc(cinemaLookup, cinemaKey, "cinema")._id,
  }));

  const docs = await Room.insertMany(preparedRooms);
  return mapInsertedByKey(roomsData, docs);
};

const seedShowtimes = async (movieLookup, cinemaLookup, roomLookup, userLookup) => {
  const preparedShowtimes = showtimesData.map(
    ({
      key,
      movieKey,
      cinemaKey,
      roomKey,
      startOffsetDays,
      startHour,
      startMinute = 0,
      heldSeats = [],
      ...showtime
    }) => {
      const movie = getRequiredDoc(movieLookup, movieKey, "movie");
      const startTime = buildShowtimeStart(startOffsetDays, startHour, startMinute);
      const endTime = new Date(startTime.getTime() + movie.duration * 60 * 1000);

      return {
        ...showtime,
        movieId: movie._id,
        cinemaId: getRequiredDoc(cinemaLookup, cinemaKey, "cinema")._id,
        roomId: getRequiredDoc(roomLookup, roomKey, "room")._id,
        startTime,
        endTime,
        heldSeats: heldSeats.map(({ userKey, holdMinutes = 5, ...seat }) => ({
          ...seat,
          userId: getRequiredDoc(userLookup, userKey, "user")._id,
          expiresAt: new Date(Date.now() + holdMinutes * 60 * 1000),
        })),
      };
    },
  );

  const docs = await Showtime.insertMany(preparedShowtimes);
  return mapInsertedByKey(showtimesData, docs);
};

const seedBookings = async (userLookup, movieLookup, showtimeLookup, roomLookup) => {
  const preparedBookings = bookingsData.map(
    ({ key, userKey, movieKey, showtimeKey, roomKey, ...booking }) => ({
      ...booking,
      userId: getRequiredDoc(userLookup, userKey, "user")._id,
      movieId: getRequiredDoc(movieLookup, movieKey, "movie")._id,
      showtimeId: getRequiredDoc(showtimeLookup, showtimeKey, "showtime")._id,
      roomId: getRequiredDoc(roomLookup, roomKey, "room")._id,
    }),
  );

  const docs = await Booking.insertMany(preparedBookings);
  return mapInsertedByKey(bookingsData, docs);
};

const seedTickets = async (
  bookingLookup,
  userLookup,
  movieLookup,
  showtimeLookup,
  roomLookup,
) => {
  const preparedTickets = ticketsData.map(
    ({ key, bookingKey, userKey, movieKey, showtimeKey, roomKey, ...ticket }) => ({
      ...ticket,
      bookingId: getRequiredDoc(bookingLookup, bookingKey, "booking")._id,
      userId: getRequiredDoc(userLookup, userKey, "user")._id,
      movieId: getRequiredDoc(movieLookup, movieKey, "movie")._id,
      showtimeId: getRequiredDoc(showtimeLookup, showtimeKey, "showtime")._id,
      roomId: getRequiredDoc(roomLookup, roomKey, "room")._id,
    }),
  );

  return Ticket.insertMany(preparedTickets);
};

const seed = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("Thiếu cấu hình MONGODB_URI");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected for seed");

    await clearCollections();
    console.log("Old data deleted");

    const userLookup = await seedUsers();
    const movieLookup = await seedMovies();
    const cinemaLookup = await seedCinemas();
    const roomLookup = await seedRooms(cinemaLookup);
    const showtimeLookup = await seedShowtimes(
      movieLookup,
      cinemaLookup,
      roomLookup,
      userLookup,
    );
    const bookingLookup = await seedBookings(
      userLookup,
      movieLookup,
      showtimeLookup,
      roomLookup,
    );
    await seedTickets(
      bookingLookup,
      userLookup,
      movieLookup,
      showtimeLookup,
      roomLookup,
    );

    console.log("Seed data inserted successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
