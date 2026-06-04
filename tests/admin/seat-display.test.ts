import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getSeatDisplayLabel } from '../../admin-web/src/utils/seatDisplay.ts';

test('admin couple seat range labels display as the rendered seat order', () => {
  assert.equal(
    getSeatDisplayLabel({
      seatCode: 'J3-J4',
      label: 'J3-J4',
      type: 'couple',
    }),
    'J2',
  );

  assert.equal(
    getSeatDisplayLabel({
      seatCode: 'J11-J12',
      label: 'J11-J12',
      type: 'couple',
    }),
    'J6',
  );
});
