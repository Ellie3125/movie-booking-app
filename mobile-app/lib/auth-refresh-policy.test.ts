import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-ignore Node's test runner imports the source TypeScript file directly.
import { shouldAttemptTokenRefresh } from './auth-refresh-policy.ts';

test('does not refresh tokens for auth credential endpoint failures', () => {
  const credentialEndpoints = [
    '/auth/login',
    '/auth/login?next=%2Fhome',
    '/auth/register',
    '/auth/admin/login',
    '/auth/refresh-token',
  ];

  for (const url of credentialEndpoints) {
    assert.equal(
      shouldAttemptTokenRefresh({
        statusCode: 401,
        requestUrl: url,
        hasRetried: false,
      }),
      false,
      `${url} should surface the original auth error`,
    );
  }
});

test('refreshes tokens once for protected endpoint 401 responses', () => {
  assert.equal(
    shouldAttemptTokenRefresh({
      statusCode: 401,
      requestUrl: '/bookings',
      hasRetried: false,
    }),
    true,
  );

  assert.equal(
    shouldAttemptTokenRefresh({
      statusCode: 401,
      requestUrl: '/bookings',
      hasRetried: true,
    }),
    false,
  );
});
