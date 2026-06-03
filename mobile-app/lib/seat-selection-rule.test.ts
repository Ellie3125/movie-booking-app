import assert from 'node:assert/strict';
import test from 'node:test';

// @ts-ignore Node's test runner imports the source TypeScript file directly.
import { OUTER_EDGE_EMPTY_SEAT_WARNING, getEdgeSeatSelectionConflict, groupSeatsByRow, sortSeatsInPhysicalOrder } from './seat-selection-rule.ts';

const seat = (
  seatCode: string,
  rowIndex: number,
  columnIndex: number,
  type = 'regular',
) => ({
  seatCode,
  label: seatCode,
  rowLabel: seatCode.match(/^[A-Za-z]+/)?.[0] ?? String(rowIndex),
  rowIndex,
  columnIndex,
  type,
});

test('detects one empty selectable seat on either outer edge at checkout time', () => {
  const layout = [[seat('A1', 0, 0), seat('A2', 0, 1), seat('A3', 0, 2), seat('A4', 0, 3)]];

  const leftConflict = getEdgeSeatSelectionConflict(layout, [], ['A2', 'A3', 'A4']);
  assert.equal(leftConflict?.side, 'left');
  assert.equal(leftConflict?.edgeCode, 'A1');
  assert.equal(leftConflict?.message, OUTER_EDGE_EMPTY_SEAT_WARNING);

  const rightConflict = getEdgeSeatSelectionConflict(layout, [], ['A1', 'A2', 'A3']);
  assert.equal(rightConflict?.side, 'right');
  assert.equal(rightConflict?.edgeCode, 'A4');
  assert.equal(rightConflict?.message, OUTER_EDGE_EMPTY_SEAT_WARNING);
});

test('allows checkout when an outer edge has zero or more than one empty selectable seat', () => {
  const layout = [[seat('A1', 0, 0), seat('A2', 0, 1), seat('A3', 0, 2), seat('A4', 0, 3)]];

  assert.equal(getEdgeSeatSelectionConflict(layout, [], ['A1', 'A2', 'A3', 'A4']), null);
  assert.equal(getEdgeSeatSelectionConflict(layout, [], ['A3', 'A4']), null);
});

test('ignores booked held and disabled seats when checking selectable row edges', () => {
  const layout = [[
    seat('A1', 0, 0),
    seat('A2', 0, 1),
    seat('A3', 0, 2),
    seat('A4', 0, 3),
    seat('A5', 0, 4, 'disabled'),
  ]];
  const seatStates = [
    { seatCode: 'A1', status: 'booked' },
    { seatCode: 'A2', status: 'held' },
    { seatCode: 'A3', status: 'available' },
    { seatCode: 'A4', status: 'available' },
    { seatCode: 'A5', status: 'available' },
  ];

  const conflict = getEdgeSeatSelectionConflict(layout, seatStates, ['A4']);

  assert.equal(conflict?.side, 'left');
  assert.equal(conflict?.edgeCode, 'A3');
  assert.equal(conflict?.message, OUTER_EDGE_EMPTY_SEAT_WARNING);
});

test('groups seats by physical row and sorts by physical order before validation', () => {
  const unorderedSeats = [
    seat('B2', 1, 1),
    seat('A2', 0, 1),
    seat('B1', 1, 0),
    seat('A1', 0, 0),
  ];

  assert.deepEqual(sortSeatsInPhysicalOrder(unorderedSeats).map((item) => item.seatCode), [
    'A1',
    'A2',
    'B1',
    'B2',
  ]);

  const groupedRows = groupSeatsByRow([[unorderedSeats[0], unorderedSeats[2]], [unorderedSeats[1], unorderedSeats[3]]]);

  assert.deepEqual(
    groupedRows.map((row) => row.seats.map((item) => item.code)),
    [
      ['A1', 'A2'],
      ['B1', 'B2'],
    ],
  );
});
