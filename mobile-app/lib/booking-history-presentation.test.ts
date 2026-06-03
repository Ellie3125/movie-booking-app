import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-ignore Node's test runner imports the source TypeScript file directly.
import { getBookingHistoryStatusPresentation, isBookingHistoryDetailDisabled } from './booking-history-presentation.ts';

test('maps booking statuses to semantic history card presentation tokens', () => {
  assert.deepEqual(getBookingHistoryStatusPresentation('confirmed'), {
    label: 'Đã xác nhận',
    tone: 'success',
    backgroundColor: '#DCFCE7',
    textColor: '#007432',
    disabled: false,
  });

  assert.deepEqual(getBookingHistoryStatusPresentation('held'), {
    label: 'Chờ thanh toán',
    tone: 'warning',
    backgroundColor: '#F3E7D4',
    textColor: '#714600',
    disabled: false,
  });

  assert.deepEqual(getBookingHistoryStatusPresentation('cancelled'), {
    label: 'Đã hủy',
    tone: 'danger',
    backgroundColor: '#FCEBEC',
    textColor: '#9B3436',
    disabled: true,
  });
});

test('disables ticket detail affordances only for terminal unavailable bookings', () => {
  assert.equal(isBookingHistoryDetailDisabled('paid'), false);
  assert.equal(isBookingHistoryDetailDisabled('pending_payment'), false);
  assert.equal(isBookingHistoryDetailDisabled('expired'), true);
  assert.equal(isBookingHistoryDetailDisabled('cancelled'), true);
});
