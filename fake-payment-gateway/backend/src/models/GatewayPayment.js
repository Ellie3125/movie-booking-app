const mongoose = require('mongoose');
const { GATEWAY_PAYMENT_STATUS } = require('../constants/payment.constants');

const GatewayPaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: [true, 'paymentId is required'],
      trim: true,
      unique: true,
      index: true,
    },
    bookingId: {
      type: String,
      required: [true, 'bookingId is required'],
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0, 'amount must not be negative'],
    },
    currency: {
      type: String,
      required: [true, 'currency is required'],
      trim: true,
      uppercase: true,
    },
    receiverBankCode: {
      type: String,
      required: [true, 'receiverBankCode is required'],
      trim: true,
      uppercase: true,
    },
    receiverAccountNumber: {
      type: String,
      required: [true, 'receiverAccountNumber is required'],
      trim: true,
    },
    receiverAccountName: {
      type: String,
      required: [true, 'receiverAccountName is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(GATEWAY_PAYMENT_STATUS),
      default: GATEWAY_PAYMENT_STATUS.PENDING,
      index: true,
    },
    callbackUrl: {
      type: String,
      required: [true, 'callbackUrl is required'],
      trim: true,
    },
    returnUrl: {
      type: String,
      required: [true, 'returnUrl is required'],
      trim: true,
    },
    payerAccountNumber: {
      type: String,
      trim: true,
      default: null,
    },
    transactionCode: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    expiredAt: {
      type: Date,
      required: [true, 'expiredAt is required'],
      index: true,
    },
    requestSignature: {
      type: String,
      required: [true, 'requestSignature is required'],
      trim: true,
    },
    requestCanonicalString: {
      type: String,
      required: [true, 'requestCanonicalString is required'],
      trim: true,
    },
    requestPayload: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'requestPayload is required'],
    },
    callbackSignature: {
      type: String,
      trim: true,
      default: null,
    },
    callbackCanonicalString: {
      type: String,
      trim: true,
      default: null,
    },
    rawCallbackResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    callbackDeliveredAt: {
      type: Date,
      default: null,
    },
    callbackAttempts: {
      type: Number,
      default: 0,
      min: [0, 'callbackAttempts must not be negative'],
    },
    failureReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

GatewayPaymentSchema.index({ status: 1, expiredAt: 1 });

module.exports = mongoose.model('GatewayPayment', GatewayPaymentSchema);
