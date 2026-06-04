/**
 * SPEC Disclosure
 * Autonomous Decisions:
 * - Kept the X-Gateway-Signature header for backward compatibility, while successfully embedding the signature in the body as required by the backend.
 * Deviations:
 * - None.
 * Trade-offs:
 * - None.
 * Context/Notes:
 * - The signature is generated via createSignature helper using the official CALLBACK_FIELDS list of key names.
 */
const axios = require('axios');
const { callbackLogs } = require('../configs/memoryDb');
const env = require('../configs/env');
const { createSignature } = require('../utils/hmac.util');
const { CALLBACK_FIELDS } = require('../constants/signature.constants');

const sendPaymentCallback = async (payment) => {
  // Status gửi đi bắt buộc là in hoa: SUCCESS, FAILED, CANCELLED, EXPIRED
  const status = payment.status.toUpperCase();

  const callbackPayload = {
    paymentId: String(payment.paymentId),
    bookingId: String(payment.bookingId),
    paidAmount: Number(payment.amount),
    currency: String(payment.currency || 'VND').toUpperCase(),
    transactionCode: payment.transactionCode ? String(payment.transactionCode) : '',
    status,
    paidAt: payment.paidAt ? new Date(payment.paidAt).toISOString() : '',
    sourceAccountNo: payment.payerAccountNumber ? String(payment.payerAccountNumber) : '',
    receiverAccountNo: String(payment.receiverAccountNumber || ''),
  };

  // Tính chữ ký HMAC bằng cách sử dụng utility của gateway với CALLBACK_FIELDS
  const { signature } = createSignature({
    payload: callbackPayload,
    fields: CALLBACK_FIELDS,
    secret: env.callbackSignatureSecret,
  });

  const requestBody = {
    ...callbackPayload,
    signature,
  };

  console.log(`[CallbackService] Sending callback for Payment ID: ${callbackPayload.paymentId}, Status: ${status}, Target: ${payment.callbackUrl}`);

  let isSuccess = false;
  let statusCode = null;
  let responseData = null;

  try {
    const response = await axios.post(payment.callbackUrl, requestBody, {
      timeout: env.callbackTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Signature': signature, // Gửi kèm header để tương thích nếu cần
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

  const logId = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  callbackLogs.set(logId, {
    paymentId: payment.paymentId,
    payload: requestBody,
    signature,
    callbackUrl: payment.callbackUrl,
    isSuccess,
    statusCode,
    responseData,
    createdAt: new Date(),
  });

  payment.callbackSignature = signature;
  payment.rawCallbackResponse = {
    statusCode,
    data: responseData,
  };
  payment.callbackAttempts = (payment.callbackAttempts || 0) + 1;

  if (isSuccess) {
    payment.callbackDeliveredAt = new Date();
  }

  return {
    isSuccess,
    statusCode,
    responseData,
    signature,
  };
};

module.exports = {
  sendPaymentCallback,
};
