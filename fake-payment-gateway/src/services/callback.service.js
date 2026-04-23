const axios = require('axios');
const GatewayCallbackLog = require('../models/GatewayCallbackLog');
const env = require('../configs/env');
const { CALLBACK_FIELDS } = require('../constants/signature.constants');
const { createSignature } = require('../utils/hmac.util');

const buildCallbackPayload = (payment) => ({
  paymentId: payment.paymentId,
  bookingId: payment.bookingId,
  status: payment.status,
  paidAmount: payment.amount,
  currency: payment.currency,
  transactionCode: payment.transactionCode,
  payerAccountNumber: payment.payerAccountNumber,
  paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString() : null,
});

const buildCallbackKey = (payment) =>
  [
    payment.paymentId,
    payment.status,
    payment.transactionCode || '',
    payment.paidAt ? new Date(payment.paidAt).toISOString() : '',
  ].join('|');

const sendPaymentCallback = async (payment) => {
  const callbackPayload = buildCallbackPayload(payment);
  const callbackKey = buildCallbackKey(payment);

  const existingSuccessfulLog = await GatewayCallbackLog.findOne({
    callbackKey,
    callbackUrl: payment.callbackUrl,
    isSuccess: true,
  })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  if (existingSuccessfulLog) {
    return {
      isSuccess: true,
      skipped: true,
      statusCode: existingSuccessfulLog.statusCode,
      responseData: existingSuccessfulLog.responseData,
      signature: existingSuccessfulLog.signature,
    };
  }

  const { canonicalString, signature } = createSignature({
    payload: callbackPayload,
    fields: CALLBACK_FIELDS,
    secret: env.callbackSignatureSecret,
  });

  let isSuccess = false;
  let statusCode = null;
  let responseData = null;

  try {
    const response = await axios.post(payment.callbackUrl, callbackPayload, {
      timeout: env.callbackTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature,
      },
      validateStatus: () => true,
    });

    statusCode = response.status;
    responseData = response.data;
    isSuccess = response.status >= 200 && response.status < 300;
  } catch (error) {
    statusCode = error.response?.status || 500;
    responseData = {
      message: error.message,
      data: error.response?.data || null,
    };
  }

  await GatewayCallbackLog.create({
    paymentId: payment.paymentId,
    callbackKey,
    payload: callbackPayload,
    signature,
    callbackUrl: payment.callbackUrl,
    isSuccess,
    statusCode,
    responseData,
  });

  payment.callbackSignature = signature;
  payment.callbackCanonicalString = canonicalString;
  payment.rawCallbackResponse = {
    statusCode,
    data: responseData,
  };
  payment.callbackAttempts = (payment.callbackAttempts || 0) + 1;

  if (isSuccess) {
    payment.callbackDeliveredAt = new Date();
  }

  await payment.save();

  return {
    isSuccess,
    skipped: false,
    statusCode,
    responseData,
    signature,
    canonicalString,
  };
};

module.exports = {
  buildCallbackPayload,
  sendPaymentCallback,
};
