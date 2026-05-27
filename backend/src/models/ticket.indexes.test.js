const assert = require('node:assert/strict');
const test = require('node:test');

const Ticket = require('./Ticket');

test('ticketCode is the only unique Ticket index', () => {
  const uniqueIndexes = Ticket.schema
    .indexes()
    .filter(([, options]) => options?.unique)
    .map(([fields]) => fields);

  assert.deepEqual(uniqueIndexes, [{ ticketCode: 1 }]);
});
