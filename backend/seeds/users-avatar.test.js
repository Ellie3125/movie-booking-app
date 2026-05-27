const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const users = require('./data/users.data');

test('seed user avatars point to files served by /uploads/avatars', () => {
  for (const user of users) {
    assert.match(user.avatar, /^\/uploads\/avatars\/.+/);

    const avatarPath = user.avatar.replace(/^\/uploads\//, '');
    const filePath = path.join(__dirname, '..', 'public', 'uploads', avatarPath);

    assert.equal(
      fs.existsSync(filePath),
      true,
      `${user.email} avatar file is missing: ${user.avatar}`,
    );
  }
});
