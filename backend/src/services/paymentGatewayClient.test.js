const assert = require('node:assert/strict');
const test = require('node:test');

const { createGatewayPaymentSession } = require('./paymentGatewayClient');

test('posts create-session payload to the configured fake gateway', async () => {
  const payload = {
    paymentId: 'PAY-001',
    bookingId: 'BOOKING-001',
    amount: 250000,
    currency: 'VND',
  };
  let request = null;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: {
          paymentId: payload.paymentId,
          paymentUrl: 'http://localhost:7000/gateway/pay/PAY-001',
        },
      }),
    };
  };

  const data = await createGatewayPaymentSession({
    gatewayBaseUrl: 'http://localhost:7000/',
    payload,
    fetchImpl,
  });

  assert.equal(request.url, 'http://localhost:7000/gateway/api/create-session');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(request.options.body), payload);
  assert.equal(data.paymentUrl, 'http://localhost:7000/gateway/pay/PAY-001');
});

test('raises a bad gateway error when fake gateway rejects create-session', async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 401,
    json: async () => ({
      success: false,
      message: 'Create-session signature is invalid',
      code: 'INVALID_CREATE_SESSION_SIGNATURE',
    }),
  });

  await assert.rejects(
    () =>
      createGatewayPaymentSession({
        gatewayBaseUrl: 'http://localhost:7000',
        payload: { paymentId: 'PAY-001' },
        fetchImpl,
      }),
    (error) => {
      assert.equal(error.statusCode, 502);
      assert.equal(error.code, 'PAYMENT_GATEWAY_CREATE_SESSION_FAILED');
      assert.match(error.message, /Create-session signature is invalid/);
      return true;
    }
  );
});
