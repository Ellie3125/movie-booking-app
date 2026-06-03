import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterAvailableBookingDates,
  filterAvailableShowtimes,
  isFutureShowtime,
  parseShowtimeDateTime,
} from './booking-availability.ts';

const localDate = (year, month, day, hour, minute) =>
  new Date(year, month - 1, day, hour, minute);

const localIso = (year, month, day, hour, minute) =>
  localDate(year, month, day, hour, minute).toISOString();

const localDateKey = (year, month, day) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

test('filters past dates and today showtimes that already started', () => {
  const now = localDate(2026, 6, 3, 10, 30);
  const showtimes = [
    { id: 'yesterday', startTime: localIso(2026, 6, 2, 21, 0) },
    { id: 'today-past', startTime: localIso(2026, 6, 3, 10, 29) },
    { id: 'today-now', startTime: localIso(2026, 6, 3, 10, 30) },
    { id: 'today-future', startTime: localIso(2026, 6, 3, 22, 0) },
    { id: 'tomorrow', startTime: localIso(2026, 6, 4, 9, 0) },
  ];

  assert.deepEqual(
    filterAvailableShowtimes(showtimes, now).map((showtime) => showtime.id),
    ['today-now', 'today-future', 'tomorrow'],
  );
});

test('keeps today only when today still has at least one future showtime', () => {
  const now = localDate(2026, 6, 3, 23, 0);
  const dates = filterAvailableBookingDates(
    [
      { id: 'today-morning', startTime: localIso(2026, 6, 3, 9, 0) },
      { id: 'today-evening', startTime: localIso(2026, 6, 3, 22, 59) },
      { id: 'tomorrow-morning', startTime: localIso(2026, 6, 4, 9, 0) },
    ],
    now,
  );

  assert.deepEqual(dates, [
    {
      key: localDateKey(2026, 6, 4),
      showtimeIds: ['tomorrow-morning'],
    },
  ]);
});

test('parses separate date and time fields as local device date time', () => {
  const now = localDate(2026, 6, 3, 10, 30);

  assert.equal(
    isFutureShowtime({ date: '2026-06-03', startTime: '10:30 - 12:00' }, now),
    true,
  );
  assert.equal(
    isFutureShowtime({ date: '2026-06-03', startTime: '10:29 - 12:00' }, now),
    false,
  );
  assert.deepEqual(parseShowtimeDateTime({ date: '2026-06-03', startTime: '10:30' }), now);
});
