const { mockBankAccounts } = require('../configs/memoryDb');
const ApiError = require('../utils/apiError');

const listActiveMockBankAccounts = async () => {
  return mockBankAccounts
    .filter(acc => acc.isActive)
    .sort((a, b) => b.balance - a.balance);
};

const debitMockBankAccount = async ({ payerAccountNumber, amount }) => {
  const account = mockBankAccounts.find(
    acc => acc.accountNumber === payerAccountNumber
  );

  if (!account) {
    throw ApiError.badRequest(
      'Payer mock bank account does not exist',
      'PAYER_ACCOUNT_NOT_FOUND'
    );
  }

  if (!account.isActive) {
    throw ApiError.conflict(
      'Payer mock bank account is inactive',
      'PAYER_ACCOUNT_INACTIVE'
    );
  }

  if (account.balance < amount) {
    throw ApiError.conflict(
      'Payer mock bank account balance is insufficient',
      'INSUFFICIENT_MOCK_BALANCE'
    );
  }

  account.balance -= amount;
  return account;
};

module.exports = {
  listActiveMockBankAccounts,
  debitMockBankAccount,
};

