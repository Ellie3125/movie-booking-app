const mongoose = require('mongoose');
const { CALLBACK_LOG_STATUS } = require('../constants/payment.constants');

const PaymentCallbackLogSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: [true, 'paymentId là bắt buộc'],
      trim: true,
      index: true,
    },
    bookingId: {
      type: String,
      required: [true, 'bookingId là bắt buộc'],
      trim: true,
      index: true,
    },
    transactionCode: {
      type: String,
      required: [true, 'transactionCode là bắt buộc'],
      trim: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: [true, 'idempotencyKey là bắt buộc'],
      trim: true,
      unique: true,
      index: true,
    },
    signature: {
      type: String,
      required: [true, 'signature là bắt buộc'],
      trim: true,
    },
    canonicalString: {
      type: String,
      required: [true, 'canonicalString là bắt buộc'],
      trim: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'payload là bắt buộc'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(CALLBACK_LOG_STATUS),
        message: 'Trạng thái callback log không hợp lệ: {VALUE}',
      },
      default: CALLBACK_LOG_STATUS.RECEIVED,
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

PaymentCallbackLogSchema.index({ paymentId: 1, createdAt: -1 });

module.exports = mongoose.model('PaymentCallbackLog', PaymentCallbackLogSchema);
