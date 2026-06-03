const mongoose = require('mongoose');
const env = require('./env');
const GatewayPayment = require('../models/GatewayPayment');
const MockBankAccount = require('../models/MockBankAccount');
const GatewayCallbackLog = require('../models/GatewayCallbackLog');

const connectDB = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(env.mongoUri);
  await Promise.all([
    GatewayPayment.init(),
    MockBankAccount.init(),
    GatewayCallbackLog.init(),
  ]);
  console.log('MongoDB connected');
};

module.exports = connectDB;
