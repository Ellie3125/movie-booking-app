const mongoose = require('mongoose');
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

const destroy = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    console.log('Clearing all data...');
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
    console.log('All data cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

destroy();
