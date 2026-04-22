const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('../src/configs/db');
const MockBankAccount = require('../src/models/MockBankAccount');
const mockBankAccounts = require('./data/mockBankAccounts');

const seedMockBankAccounts = async () => {
  try {
    await connectDB();
    console.log('Connected MongoDB for mock bank account seed');

    await MockBankAccount.deleteMany({});
    await MockBankAccount.insertMany(mockBankAccounts);

    console.log('Mock bank accounts seeded successfully');
  } catch (error) {
    console.error('Failed to seed mock bank accounts:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedMockBankAccounts();
