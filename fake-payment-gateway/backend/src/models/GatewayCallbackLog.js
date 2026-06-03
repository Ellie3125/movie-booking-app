const mongoose = require('mongoose');

const GatewayCallbackLogSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: [true, 'paymentId is required'],
      trim: true,
      index: true,
    },
    callbackKey: {
      type: String,
      required: [true, 'callbackKey is required'],
      trim: true,
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'payload is required'],
    },
    signature: {
      type: String,
      required: [true, 'signature is required'],
      trim: true,
    },
    callbackUrl: {
      type: String,
      required: [true, 'callbackUrl is required'],
      trim: true,
    },
    isSuccess: {
      type: Boolean,
      required: [true, 'isSuccess is required'],
      default: false,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    responseData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

GatewayCallbackLogSchema.index({ paymentId: 1, createdAt: -1 });
GatewayCallbackLogSchema.index({ callbackKey: 1, isSuccess: 1 });

module.exports = mongoose.model('GatewayCallbackLog', GatewayCallbackLogSchema);
