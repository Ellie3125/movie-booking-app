const assert = require('node:assert/strict');
const test = require('node:test');

const { CALLBACK_FIELDS } = require('../constants/signature.constants');
const { buildCallbackPayload } = require('./callback.service');

test('builds backend-compatible callback payload fields', () => {
  const paidAt = '2026-06-01T10:00:00.000Z';
  const payload = buildCallbackPayload({
    paymentId: 'PAY-001',
    bookingId: '64a7b8c9d0e1f23456789012',
    status: 'SUCCESS',
    amount: 250000,
    currency: 'VND',
    transactionCode: 'FGW-001',
    payerAccountNumber: '9704000011111111',
    receiverAccountNumber: '1900100009999',
    paidAt,
  });

  assert.deepEqual(Object.keys(payload), CALLBACK_FIELDS);
  assert.deepEqual(payload, {
    paymentId: 'PAY-001',
    bookingId: '64a7b8c9d0e1f23456789012',
    paidAmount: 250000,
    currency: 'VND',
    transactionCode: 'FGW-001',
    status: 'SUCCESS',
    paidAt,
    sourceAccountNo: '9704000011111111',
    receiverAccountNo: '1900100009999',
  });
});
