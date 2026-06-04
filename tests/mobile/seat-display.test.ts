import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getSeatDisplayLabel } from '../../mobile-app/lib/seat-display.ts';

test('couple seat range labels display as the rendered seat order', () => {
  assert.equal(
    getSeatDisplayLabel({
      seatCode: 'J3-J4',
      label: 'J3-J4',
      seatType: 'couple',
    }),
    'J2',
  );

  assert.equal(
    getSeatDisplayLabel({
      seatCode: 'J11-J12',
      label: 'J11-J12',
      seatType: 'couple',
    }),
    'J6',
  );
});

test('regular seats keep their own label', () => {
  assert.equal(
    getSeatDisplayLabel({
      seatCode: 'A1',
      label: 'A1',
      seatType: 'regular',
    }),
    'A1',
  );
});
