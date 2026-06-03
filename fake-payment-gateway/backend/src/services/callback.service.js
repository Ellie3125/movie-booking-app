const crypto = require('crypto');
const axios = require('axios');
const { callbackLogs } = require('../configs/memoryDb');
const env = require('../configs/env');

const sendPaymentCallback = async (payment) => {
  const paymentRequestId = String(payment.paymentId);
  const bookingId = String(payment.bookingId);
  // Status gửi đi bắt buộc là 'success' hoặc 'failed'
  const status = payment.status.toLowerCase() === 'success' ? 'success' : 'failed';
  const resolvedAt = payment.paidAt ? new Date(payment.paidAt).toISOString() : new Date().toISOString();

  // Payload được ký & gửi đi (đúng thứ tự key)
  const callbackPayload = {
    paymentRequestId,
    bookingId,
    status,
    resolvedAt,
  };

  // Tính chữ ký HMAC
  const signature = crypto
    .createHmac('sha256', env.callbackSignatureSecret)
    .update(JSON.stringify(callbackPayload))
    .digest('hex');

  let isSuccess = false;
  let statusCode = null;
  let responseData = null;

  try {
    const response = await axios.post(payment.callbackUrl, callbackPayload, {
      timeout: env.callbackTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Signature': signature,
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
    payload: callbackPayload,
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
