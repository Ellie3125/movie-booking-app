const assert = require('node:assert/strict');
const test = require('node:test');

const { createSessionSchema } = require('./gateway.validation');

const validCreateSessionPayload = {
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
  signature: 'a'.repeat(64),
};

test('accepts app deep-link returnUrl values for create-session', () => {
  const { error } = createSessionSchema.body.validate(validCreateSessionPayload);

  assert.equal(error, undefined);
});

test('rejects unsafe returnUrl protocols for create-session', () => {
  const { error } = createSessionSchema.body.validate({
    ...validCreateSessionPayload,
    returnUrl: 'javascript:alert(1)',
  });

  assert.match(error.message, /returnUrl/);
});
