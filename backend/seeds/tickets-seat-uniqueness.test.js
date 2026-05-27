const assert = require('node:assert/strict');
const test = require('node:test');

const bookings = require('./data/bookings.data');
const tickets = require('./data/tickets.data');

test('seed bookings do not contain duplicate seats in the same booking', () => {
  for (const booking of bookings) {
    const seenSeats = new Set();

    for (const seat of booking.seats || []) {
      const key = seat.seatCode;

      assert.equal(
        seenSeats.has(key),
        false,
        `${booking.bookingCode || booking._id} contains duplicate seat ${key}`,
      );

      seenSeats.add(key);
    }
  }
});

test('seed tickets do not duplicate the same seat within a booking', () => {
  const seenTickets = new Set();

  for (const ticket of tickets) {
    const key = `${ticket.bookingId}|${ticket.seat.seatCode}`;

    assert.equal(
      seenTickets.has(key),
      false,
      `${ticket.bookingId} contains duplicate ticket for seat ${ticket.seat.seatCode}`,
    );

    seenTickets.add(key);
  }
});
