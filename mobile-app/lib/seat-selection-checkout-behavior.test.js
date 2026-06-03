const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const seatScreenSource = fs.readFileSync(
  path.join(__dirname, '..', 'app', '(user)', 'booking', 'seats.tsx'),
  'utf8',
);

const getFunctionSource = (functionName) => {
  const start = seatScreenSource.indexOf(`const ${functionName} =`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const bodyStart = seatScreenSource.indexOf('{', start);
  assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

  let depth = 0;

  for (let index = bodyStart; index < seatScreenSource.length; index += 1) {
    const character = seatScreenSource[index];

    if (character === '{') {
      depth += 1;
    }

    if (character === '}') {
      depth -= 1;

      if (depth === 0) {
        return seatScreenSource.slice(start, index + 1);
      }
    }
  }

  assert.fail(`${functionName} body should close`);
};

test('seat selection screen only validates outer-edge gaps when continuing to checkout', () => {
  const handleSeatPressSource = getFunctionSource('handleSeatPress');
  const handleContinueSource = getFunctionSource('handleContinue');

  assert.doesNotMatch(handleSeatPressSource, /getEdgeSeatSelectionConflict/);
  assert.match(handleSeatPressSource, /setSelectionNotice\(''\)/);
  assert.match(handleContinueSource, /getEdgeSeatSelectionConflict/);
});
