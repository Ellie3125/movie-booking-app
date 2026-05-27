const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const editProfileSource = fs.readFileSync(
  path.join(__dirname, '..', 'app', '(user)', 'profile', 'edit.tsx'),
  'utf8',
);

test('edit profile exposes direct avatar actions instead of relying on Alert action sheets', () => {
  assert.match(editProfileSource, /Tải ảnh lên/);
  assert.match(editProfileSource, /Chọn ảnh mẫu/);
  assert.doesNotMatch(editProfileSource, /Cập nhật ảnh đại diện/);
});
