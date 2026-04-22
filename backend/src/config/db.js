const mongoose = require('mongoose');
const env = require('./env');
const Booking = require('../models/Booking');
const PaymentTransaction = require('../models/PaymentTransaction');
const MockBankAccount = require('../models/MockBankAccount');
const PaymentCallbackLog = require('../models/PaymentCallbackLog');

const syncBookingTransactionCodeIndex = async () => {
  const desiredOptions = {
    name: 'transactionCode_1',
    unique: true,
    partialFilterExpression: {
      transactionCode: { $type: 'string' },
    },
  };

  let currentIndexes = [];

  try {
    currentIndexes = await Booking.collection.indexes();
  } catch (error) {
    if (error.code !== 26 && error.codeName !== 'NamespaceNotFound') {
      throw error;
    }
  }

  const legacyTransactionCodeIndex = currentIndexes.find(
    (index) => index.name === desiredOptions.name
  );

  const hasDesiredTransactionCodeIndex =
    legacyTransactionCodeIndex &&
    legacyTransactionCodeIndex.unique === true &&
    legacyTransactionCodeIndex.partialFilterExpression?.transactionCode?.$type ===
      'string';

  if (legacyTransactionCodeIndex && !hasDesiredTransactionCodeIndex) {
    await Booking.collection.dropIndex(desiredOptions.name);
    console.log('Dropped legacy booking transactionCode index');
  }

  await Booking.collection.createIndex(
    { transactionCode: 1 },
    desiredOptions
  );
};

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    await syncBookingTransactionCodeIndex();
    await Promise.all([
      Booking.init(),
      PaymentTransaction.init(),
      MockBankAccount.init(),
      PaymentCallbackLog.init(),
    ]);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
