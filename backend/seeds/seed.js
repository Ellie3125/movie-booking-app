const mongoose = require('mongoose');
require('dotenv').config();

const {
  User,
  Movie,
  CinemaBrand,
  Cinema,
  Room,
  Showtime,
  Booking,
  Ticket,
  PaymentTransaction,
  PaymentCallbackLog,
  Session
} = require('../src/models');

// Data imports
const usersData = require('./data/users.data');
const moviesData = require('./data/movies.data');
const cinemaBrandsData = require('./data/cinemaBrands.data');
const cinemasData = require('./data/cinemas.data');
const roomsData = require('./data/rooms.data');
const showtimesData = require('./data/showtimes.data');
const bookingsData = require('./data/bookings.data');
const paymentsData = require('./data/payments.data');
const ticketsData = require('./data/tickets.data');
const { prepareUsersForInsert } = require('./prepareSeedUsers');

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
      CinemaBrand.deleteMany({}),
      Cinema.deleteMany({}),
      Room.deleteMany({}),
      Showtime.deleteMany({}),
      Booking.deleteMany({}),
      Ticket.deleteMany({}),
      PaymentTransaction.deleteMany({}),
      PaymentCallbackLog.deleteMany({}),
      Session.deleteMany({})
    ]);

    // Drop indexes for collections that had schema changes to avoid E11000 errors from stale indexes
    for (const Model of [Ticket, Booking]) {
      try {
        await Model.collection.dropIndexes();
      } catch (e) {
        // Ignore if collection doesn't exist yet.
        if (e.codeName !== 'NamespaceNotFound' && e.code !== 26) {
          throw e;
        }
      }
    }

    await Promise.all([
      Ticket.syncIndexes(),
      Booking.syncIndexes(),
    ]);
    console.log('Old data cleared.');

    // 2. Insert new data
    console.log('Seeding Users...');
    await User.insertMany(await prepareUsersForInsert(usersData));

    console.log('Seeding Movies...');
    await Movie.insertMany(moviesData);

    console.log('Seeding Cinema Brands...');
    await CinemaBrand.insertMany(cinemaBrandsData);

    console.log('Seeding Cinemas...');
    await Cinema.insertMany(cinemasData);

    console.log('Seeding Rooms...');
    await Room.create(roomsData);

    console.log('Seeding Showtimes...');
    await Showtime.insertMany(showtimesData);

    console.log('Seeding Bookings...');
    await Booking.insertMany(bookingsData);

    console.log('Seeding Payments...');
    await PaymentTransaction.insertMany(paymentsData);

    console.log('Seeding Tickets...');
    await Ticket.insertMany(ticketsData);

    console.log('All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
