const assert = require('node:assert/strict');
const test = require('node:test');
const bcrypt = require('bcryptjs');

const users = require('./data/users.data');
const { prepareUsersForInsert } = require('./prepareSeedUsers');

test('seed users expose plain passwords for local test login', () => {
  for (const user of users) {
    assert.equal(
      typeof user.password,
      'string',
      `${user.email} should declare a plain password`,
    );
    assert.ok(
      user.password.length >= 6,
      `${user.email} should declare a usable test password`,
    );
    assert.equal(
      Object.hasOwn(user, 'passwordHash'),
      false,
      `${user.email} should not store a password hash in source seed data`,
    );
  }
});

test('prepareUsersForInsert hashes plain passwords and strips them before insert', async () => {
  const preparedUsers = await prepareUsersForInsert(users);

  assert.equal(preparedUsers.length, users.length);

  for (let index = 0; index < preparedUsers.length; index += 1) {
    const sourceUser = users[index];
    const preparedUser = preparedUsers[index];

    assert.equal(
      Object.hasOwn(preparedUser, 'password'),
      false,
      `${sourceUser.email} should not insert the plain password`,
    );
    assert.equal(typeof preparedUser.passwordHash, 'string');
    assert.notEqual(preparedUser.passwordHash, sourceUser.password);
    assert.equal(
      await bcrypt.compare(sourceUser.password, preparedUser.passwordHash),
      true,
      `${sourceUser.email} password should match the generated hash`,
    );
    assert.equal(preparedUser.email, sourceUser.email);
  }
});
