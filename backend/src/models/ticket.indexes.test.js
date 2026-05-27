const assert = require('node:assert/strict');
const test = require('node:test');

const Ticket = require('./Ticket');

test('Ticket keeps ticketCode and booking seat pair unique only', () => {
  const uniqueIndexes = Ticket.schema
    .indexes()
    .filter(([, options]) => options?.unique)
    .map(([fields]) => fields);

  assert.deepEqual(uniqueIndexes, [
    { ticketCode: 1 },
    { bookingId: 1, 'seat.seatCode': 1 },
  ]);

  assert.equal(Ticket.schema.path('bookingId').options.unique, undefined);
  assert.equal(Ticket.schema.path('seat.seatCode').options.unique, undefined);
});
