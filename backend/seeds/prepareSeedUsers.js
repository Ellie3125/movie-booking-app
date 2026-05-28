const bcrypt = require('bcryptjs');

const PASSWORD_SALT_ROUNDS = 10;

const prepareUsersForInsert = async (users) =>
  Promise.all(
    users.map(async ({ password, passwordHash, ...user }) => {
      if (passwordHash) {
        return {
          ...user,
          passwordHash,
        };
      }

      if (!password) {
        throw new Error(`Missing plain password for seed user ${user.email || user._id}`);
      }

      return {
        ...user,
        passwordHash: await bcrypt.hash(password, PASSWORD_SALT_ROUNDS),
      };
    }),
  );

module.exports = {
  prepareUsersForInsert,
};
