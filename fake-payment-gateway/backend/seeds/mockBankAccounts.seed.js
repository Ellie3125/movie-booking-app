const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const env = require('../src/configs/env');
const MockBankAccount = require('../src/models/MockBankAccount');
const mockBankAccounts = require('./data/mockBankAccounts');

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const dropMockBankAccountCollection = async () => {
  try {
    await mongoose.connection.db
      .collection(MockBankAccount.collection.name)
      .drop();
  } catch (error) {
    if (error.codeName !== 'NamespaceNotFound') {
      throw error;
    }
  }
};

const initMockBankAccountModel = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await MockBankAccount.init();
      return;
    } catch (error) {
      if (error.code !== 276 || attempt === 4) {
        throw error;
      }

      await sleep(1500);
    }
  }
};

const seedMockBankAccounts = async () => {
  try {
    if (!env.mongoUri) {
      throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(env.mongoUri);
    console.log('Connected MongoDB for mock bank account seed');

    await dropMockBankAccountCollection();
    await sleep(1500);
    await initMockBankAccountModel();
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
