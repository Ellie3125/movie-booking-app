import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-ignore Node's test runner imports the source TypeScript file directly.
import { isSuccessfulPaymentResult, parsePaymentResultUrl } from './payment-result.ts';

test('parses successful payment return URLs from the gateway', () => {
  const result = parsePaymentResultUrl(
    'frontend://payment/result?status=success&bookingId=booking_123&paymentId=PAY_123&transactionCode=TX_123',
  );

  assert.deepEqual(result, {
    status: 'success',
    bookingId: 'booking_123',
    paymentId: 'PAY_123',
    transactionCode: 'TX_123',
    message: null,
  });
  assert.equal(isSuccessfulPaymentResult(result), true);
});

test('treats missing or non-success statuses as incomplete payments', () => {
  assert.equal(
    isSuccessfulPaymentResult(
      parsePaymentResultUrl('http://localhost:8081/payment/result?status=failed&bookingId=booking_123'),
    ),
    false,
  );

  assert.equal(
    isSuccessfulPaymentResult(parsePaymentResultUrl('http://localhost:8081/payment/result')),
    false,
  );
});
