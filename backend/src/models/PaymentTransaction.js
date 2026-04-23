const mongoose = require('mongoose');
const {
  PAYMENT_CURRENCY,
  PAYMENT_TRANSACTION_STATUS,
} = require('../constants/payment.constants');

const BankAccountSnapshotSchema = new mongoose.Schema(
  {
    bankCode: {
      type: String,
      trim: true,
      required: [true, 'bankCode là bắt buộc'],
    },
    bankName: {
      type: String,
      trim: true,
      required: [true, 'bankName là bắt buộc'],
    },
    accountNo: {
      type: String,
      trim: true,
      required: [true, 'accountNo là bắt buộc'],
    },
    accountName: {
      type: String,
      trim: true,
      required: [true, 'accountName là bắt buộc'],
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const SignatureSnapshotSchema = new mongoose.Schema(
  {
    algorithm: {
      type: String,
      default: 'HMAC-SHA256',
    },
    fields: {
      type: [String],
      default: [],
    },
    canonicalString: {
      type: String,
      trim: true,
      required: [true, 'canonicalString là bắt buộc'],
    },
    signature: {
      type: String,
      trim: true,
      required: [true, 'signature là bắt buộc'],
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const PaymentTransactionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'bookingId là bắt buộc'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId là bắt buộc'],
      index: true,
    },
    paymentId: {
      type: String,
      required: [true, 'paymentId là bắt buộc'],
      trim: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'amount là bắt buộc'],
      min: [0, 'amount không được âm'],
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
        values: Object.values(PAYMENT_TRANSACTION_STATUS),
        message: 'Trạng thái payment transaction không hợp lệ: {VALUE}',
      },
      default: PAYMENT_TRANSACTION_STATUS.PENDING,
      index: true,
    },
    receiverAccount: {
      type: BankAccountSnapshotSchema,
      required: [true, 'receiverAccount là bắt buộc'],
    },
    sourceAccount: {
      type: BankAccountSnapshotSchema,
      default: null,
    },
    sourceAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockBankAccount',
      default: null,
    },
    requestSignature: {
      type: SignatureSnapshotSchema,
      required: [true, 'requestSignature là bắt buộc'],
    },
    callbackSignature: {
      type: SignatureSnapshotSchema,
      default: null,
    },
    callbackUrl: {
      type: String,
      trim: true,
      required: [true, 'callbackUrl là bắt buộc'],
    },
    returnUrl: {
      type: String,
      trim: true,
      required: [true, 'returnUrl là bắt buộc'],
    },
    paymentUrl: {
      type: String,
      trim: true,
      required: [true, 'paymentUrl là bắt buộc'],
    },
    transactionCode: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    expiredAt: {
      type: Date,
      required: [true, 'expiredAt là bắt buộc'],
      index: true,
    },
    gatewayOpenedAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    callbackReceivedAt: {
      type: Date,
      default: null,
    },
    callbackProcessedAt: {
      type: Date,
      default: null,
    },
    callbackAttempts: {
      type: Number,
      default: 0,
      min: [0, 'callbackAttempts không được âm'],
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

PaymentTransactionSchema.index({ bookingId: 1, createdAt: -1 });
PaymentTransactionSchema.index({ bookingId: 1, status: 1, expiredAt: 1 });

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
