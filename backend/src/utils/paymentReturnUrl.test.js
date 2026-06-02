const assert = require('node:assert/strict');
const test = require('node:test');

const { resolvePaymentReturnUrl } = require('./paymentReturnUrl');

test('uses the app supplied return URL before configured and backend fallback URLs', () => {
  assert.equal(
    resolvePaymentReturnUrl({
      baseUrl: 'http://localhost:5000',
      requestedReturnUrl: 'frontend://payment/result',
      configuredReturnUrl: 'http://localhost:5000/api/v1/payments/result',
    }),
    'frontend://payment/result'
  );
});

test('falls back to configured return URL and then backend result page', () => {
  assert.equal(
    resolvePaymentReturnUrl({
      baseUrl: 'http://localhost:5000',
      requestedReturnUrl: '',
      configuredReturnUrl: 'http://localhost:8081/payment/result',
    }),
    'http://localhost:8081/payment/result'
  );

  assert.equal(
    resolvePaymentReturnUrl({
      baseUrl: 'http://localhost:5000',
      requestedReturnUrl: '',
      configuredReturnUrl: '',
    }),
    'http://localhost:5000/api/v1/payments/result'
  );
});

test('rejects unsafe return URL protocols', () => {
  assert.throws(
    () =>
      resolvePaymentReturnUrl({
        baseUrl: 'http://localhost:5000',
        requestedReturnUrl: 'javascript:alert(1)',
        configuredReturnUrl: '',
      }),
    /Unsupported payment return URL protocol/
  );
});
