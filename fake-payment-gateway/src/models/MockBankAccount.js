const mongoose = require('mongoose');

const MockBankAccountSchema = new mongoose.Schema(
  {
    bankCode: {
      type: String,
      required: [true, 'bankCode is required'],
      trim: true,
      uppercase: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'accountNumber is required'],
      trim: true,
      unique: true,
      index: true,
    },
    accountName: {
      type: String,
      required: [true, 'accountName is required'],
      trim: true,
    },
    balance: {
      type: Number,
      required: [true, 'balance is required'],
      min: [0, 'balance must not be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

MockBankAccountSchema.index({ isActive: 1, balance: -1 });

module.exports = mongoose.model('MockBankAccount', MockBankAccountSchema);
