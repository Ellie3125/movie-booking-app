const assert = require('node:assert/strict');
const { test } = require('node:test');

const { getSeatDisplayLabel } = require('./seatDisplay');

test('couple seat range labels display as the rendered seat order', () => {
  assert.equal(
    getSeatDisplayLabel({
      seatCode: 'J3-J4',
      seatLabel: 'J3-J4',
      seatType: 'couple',
    }),
    'J2',
  );

  assert.equal(
    getSeatDisplayLabel({
      seatCode: 'J11-J12',
      seatLabel: 'J11-J12',
      seatType: 'couple',
    }),
    'J6',
  );
});

test('regular seats keep their own label', () => {
  assert.equal(
    getSeatDisplayLabel({
      seatCode: 'A1',
      seatLabel: 'A1',
      seatType: 'regular',
    }),
    'A1',
  );
});
