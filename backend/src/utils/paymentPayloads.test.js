const assert = require('node:assert/strict');
const test = require('node:test');

const { buildGatewayCreateSessionPayload } = require('./paymentPayloads');

test('maps a backend payment transaction to the fake gateway create-session contract', () => {
  const transaction = {
    paymentId: 'PAY-001',
    bookingId: '64a7b8c9d0e1f23456789012',
    amount: 250000,
    currency: 'VND',
    receiverAccount: {
      bankCode: 'VCB',
      bankName: 'Vietcombank',
      accountNo: '1900100009999',
      accountName: 'BEAT CINEMA RECEIVER',
    },
    callbackUrl: 'http://localhost:5000/api/v1/payments/callback',
    returnUrl: 'frontend://payment/result',
    expiredAt: '2026-06-01T10:00:00.000Z',
  };

  assert.deepEqual(buildGatewayCreateSessionPayload(transaction), {
    paymentId: 'PAY-001',
    bookingId: '64a7b8c9d0e1f23456789012',
    amount: 250000,
    currency: 'VND',
    receiverBankCode: 'VCB',
    receiverAccountNumber: '1900100009999',
    receiverAccountName: 'BEAT CINEMA RECEIVER',
    callbackUrl: 'http://localhost:5000/api/v1/payments/callback',
    returnUrl: 'frontend://payment/result',
    expiredAt: '2026-06-01T10:00:00.000Z',
  });
});
