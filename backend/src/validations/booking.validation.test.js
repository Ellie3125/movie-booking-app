const assert = require('node:assert/strict');
const { test } = require('node:test');

const { createBookingSchema } = require('./booking.validation');

test('create booking validation accepts legacy couple seat range codes', () => {
  const { error, value } = createBookingSchema.body.validate({
    showtimeId: '507f1f77bcf86cd799439011',
    seatCodes: ['J11-J12'],
  });

  assert.equal(error, undefined);
  assert.deepEqual(value.seatCodes, ['J11-J12']);
});
