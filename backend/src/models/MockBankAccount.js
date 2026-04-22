const mongoose = require('mongoose');
const {
  MOCK_BANK_ACCOUNT_STATUS,
  PAYMENT_CURRENCY,
} = require('../constants/payment.constants');

const MockBankAccountSchema = new mongoose.Schema(
  {
    accountCode: {
      type: String,
      required: [true, 'accountCode là bắt buộc'],
      trim: true,
      unique: true,
      index: true,
    },
    bankCode: {
      type: String,
      required: [true, 'bankCode là bắt buộc'],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, 'bankName là bắt buộc'],
      trim: true,
    },
    accountNo: {
      type: String,
      required: [true, 'accountNo là bắt buộc'],
      trim: true,
      unique: true,
      index: true,
    },
    accountName: {
      type: String,
      required: [true, 'accountName là bắt buộc'],
      trim: true,
    },
    balance: {
      type: Number,
      required: [true, 'balance là bắt buộc'],
      min: [0, 'balance không được âm'],
    },
    currency: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_CURRENCY),
        message: 'currency không hợp lệ: {VALUE}',
      },
      default: PAYMENT_CURRENCY.VND,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(MOCK_BANK_ACCOUNT_STATUS),
        message: 'Trạng thái mock bank account không hợp lệ: {VALUE}',
      },
      default: MOCK_BANK_ACCOUNT_STATUS.ACTIVE,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

MockBankAccountSchema.index({ status: 1, balance: -1 });

module.exports = mongoose.model('MockBankAccount', MockBankAccountSchema);
