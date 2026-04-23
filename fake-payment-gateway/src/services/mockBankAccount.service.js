const MockBankAccount = require('../models/MockBankAccount');
const ApiError = require('../utils/apiError');

const listActiveMockBankAccounts = async () =>
  MockBankAccount.find({ isActive: true })
    .sort({ balance: -1, createdAt: 1 })
    .lean()
    .exec();

const debitMockBankAccount = async ({ payerAccountNumber, amount }) => {
  const account = await MockBankAccount.findOne({
    accountNumber: payerAccountNumber,
  }).exec();

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

  const updatedAccount = await MockBankAccount.findOneAndUpdate(
    {
      accountNumber: payerAccountNumber,
      isActive: true,
      balance: { $gte: amount },
    },
    {
      $inc: { balance: -amount },
    },
    {
      new: true,
    }
  ).exec();

  if (!updatedAccount) {
    throw ApiError.conflict(
      'Payer mock bank account balance is insufficient',
      'INSUFFICIENT_MOCK_BALANCE'
    );
  }

  return updatedAccount;
};

module.exports = {
  listActiveMockBankAccounts,
  debitMockBankAccount,
};
