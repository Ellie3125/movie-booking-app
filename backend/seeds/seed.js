const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
  User,
  Movie,
  Cinema,
  Room,
  Showtime,
  Booking,
  Ticket,
  PaymentTransaction,
  MockBankAccount,
  PaymentCallbackLog,
  Session
} = require('../src/models');

// Data imports
const usersData = require('./data/users.data');
const moviesData = require('./data/movies.data');
const cinemasData = require('./data/cinemas.data');
const roomsData = require('./data/rooms.data');
const showtimesData = require('./data/showtimes.data');
const bookingsData = require('./data/bookings.data');
const paymentsData = require('./data/payments.data');
const ticketsData = require('./data/tickets.data');
const bankAccountsData = require('./data/bankAccounts.data');

const PASSWORD_SALT_ROUNDS = 10;

const isHashed = (password) => {
  return /^\$2[ayb]\$.{56}$/.test(password);
};

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // 1. Clear old data
    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Cinema.deleteMany({}),
      Room.deleteMany({}),
      Showtime.deleteMany({}),
      Booking.deleteMany({}),
      Ticket.deleteMany({}),
      PaymentTransaction.deleteMany({}),
      MockBankAccount.deleteMany({}),
      PaymentCallbackLog.deleteMany({}),
      Session.deleteMany({})
    ]);
    console.log('Old data cleared.');

    // 2. Hash User Passwords
    console.log('Hashing user passwords...');
    const hashedUsersData = await Promise.all(
      usersData.map(async (user) => {
        if (!isHashed(user.password)) {
          const hashedPassword = await bcrypt.hash(user.password, PASSWORD_SALT_ROUNDS);
          return { ...user, password: hashedPassword };
        }
        return user;
      })
    );

    // 3. Insert new data
    console.log('Seeding Users...');
    await User.insertMany(hashedUsersData);

    console.log('Seeding Movies...');
    await Movie.insertMany(moviesData);

    console.log('Seeding Cinemas...');
    await Cinema.insertMany(cinemasData);

    console.log('Seeding Rooms...');
    await Room.insertMany(roomsData);

    console.log('Seeding Showtimes...');
    await Showtime.insertMany(showtimesData);

    console.log('Seeding Bookings...');
    await Booking.insertMany(bookingsData);

    console.log('Seeding Payments...');
    await PaymentTransaction.insertMany(paymentsData);

    console.log('Seeding Tickets...');
    await Ticket.insertMany(ticketsData);

    console.log('Seeding Bank Accounts...');
    await MockBankAccount.insertMany(bankAccountsData);

    console.log('All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
