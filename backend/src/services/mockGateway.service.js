const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const Booking = require('../models/Booking');
const MockBankAccount = require('../models/MockBankAccount');
const PaymentTransaction = require('../models/PaymentTransaction');
const env = require('../config/env');
const ApiError = require('../utils/apiError');
const { signHmacSha256 } = require('../utils/paymentHmac');
const { appendQueryParams } = require('../utils/url');
const {
  BOOKING_STATUS,
  MOCK_BANK_ACCOUNT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_CALLBACK_FIELDS,
  PAYMENT_TRANSACTION_STATUS,
} = require('../constants/payment.constants');
const {
  buildCallbackPayload,
  getPaymentReceiverAccount,
  maskAccountNo,
} = require('../utils/paymentPayloads');
const paymentService = require('./payment.service');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatMoney = (amount) =>
  Number(amount || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: env.paymentCurrency,
    maximumFractionDigits: 0,
  });

const createQrSvg = (seed) => {
  const hash = crypto.createHash('sha256').update(String(seed)).digest('hex');
  const cells = 21;
  const size = 8;
  let rects = '';

  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const index = (y * cells + x) % hash.length;
      const isDark = parseInt(hash[index], 16) % 2 === 0;

      if (isDark) {
        rects += `<rect x="${x * size}" y="${y * size}" width="${size}" height="${size}" rx="1" fill="#0f172a" />`;
      }
    }
  }

  return `<svg width="${cells * size}" height="${
    cells * size
  }" viewBox="0 0 ${cells * size} ${
    cells * size
  }" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mock QR">${rects}</svg>`;
};

const renderGatewayErrorPage = (error) => `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mock Gateway Error</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #fee2e2, #fff7ed);
        color: #111827;
      }
      .card {
        width: min(92vw, 520px);
        background: #ffffff;
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18);
      }
      h1 {
        margin-top: 0;
      }
      p {
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Khong the mo cong thanh toan</h1>
      <p>${escapeHtml(error.message || 'Da co loi xay ra.')}</p>
    </main>
  </body>
</html>`;

const renderGatewayCheckoutPage = ({
  transaction,
  booking,
  sourceAccounts,
  signature,
}) => {
  const receiverAccount = getPaymentReceiverAccount();
  const qrSvg = createQrSvg(`${transaction.paymentId}|${transaction.amount}`);
  const seatList = booking.seats
    .map(
      (seat) =>
        `<li>${escapeHtml(seat.seatLabel)} (${escapeHtml(
          seat.seatCoordinate
        )}) - ${formatMoney(seat.price)}</li>`
    )
    .join('');
  const accountOptions = sourceAccounts
    .map(
      (account, index) => `
        <label class="account-card">
          <input type="radio" name="sourceAccountId" value="${account._id}" ${
            index === 0 ? 'checked' : ''
          } />
          <span class="account-name">${escapeHtml(account.accountName)}</span>
          <span class="account-meta">${escapeHtml(
            account.bankName
          )} - ${escapeHtml(maskAccountNo(account.accountNo))}</span>
          <span class="account-balance">So du: ${formatMoney(account.balance)}</span>
        </label>
      `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mock Payment Gateway</title>
    <style>
      :root {
        color-scheme: light;
        --bg-1: #ecfeff;
        --bg-2: #fff7ed;
        --card: #ffffff;
        --ink: #0f172a;
        --muted: #64748b;
        --line: #e2e8f0;
        --accent: #0f766e;
        --accent-soft: #ccfbf1;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Arial, sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(20, 184, 166, 0.18), transparent 28%),
          radial-gradient(circle at top right, rgba(249, 115, 22, 0.16), transparent 24%),
          linear-gradient(145deg, var(--bg-1), var(--bg-2));
      }
      .wrap {
        width: min(1080px, calc(100vw - 32px));
        margin: 32px auto;
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 24px;
      }
      .card {
        background: var(--card);
        border-radius: 28px;
        padding: 28px;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.14);
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--accent);
        font-size: 12px;
        margin-bottom: 10px;
      }
      h1, h2 {
        margin-top: 0;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin: 20px 0 24px;
      }
      .meta {
        padding: 16px;
        border-radius: 18px;
        background: #f8fafc;
        border: 1px solid var(--line);
      }
      .meta .label {
        display: block;
        color: var(--muted);
        font-size: 13px;
        margin-bottom: 6px;
      }
      .meta strong {
        font-size: 16px;
      }
      ul {
        margin: 0;
        padding-left: 20px;
        color: var(--muted);
        line-height: 1.7;
      }
      .qr-box {
        display: grid;
        place-items: center;
        padding: 20px;
        border-radius: 24px;
        background: linear-gradient(180deg, #ffffff, #f8fafc);
        border: 1px solid var(--line);
        margin-bottom: 18px;
      }
      .receiver {
        padding: 18px;
        border-radius: 20px;
        background: var(--accent-soft);
        margin-bottom: 18px;
      }
      .receiver p {
        margin: 0 0 8px;
      }
      form {
        display: grid;
        gap: 14px;
      }
      .account-card {
        display: grid;
        gap: 6px;
        padding: 16px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: #fff;
      }
      .account-card input {
        justify-self: start;
        margin: 0 0 6px;
      }
      .account-name {
        font-weight: 700;
      }
      .account-meta,
      .account-balance {
        color: var(--muted);
        font-size: 14px;
      }
      button {
        margin-top: 8px;
        border: none;
        border-radius: 16px;
        padding: 16px 20px;
        background: var(--accent);
        color: #ffffff;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
      }
      @media (max-width: 840px) {
        .wrap {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="card">
        <div class="eyebrow">Third-Party Mock Gateway</div>
        <h1>Thanh toan don dat ve</h1>
        <div class="grid">
          <div class="meta">
            <span class="label">paymentId</span>
            <strong>${escapeHtml(transaction.paymentId)}</strong>
          </div>
          <div class="meta">
            <span class="label">bookingId</span>
            <strong>${escapeHtml(String(booking._id))}</strong>
          </div>
          <div class="meta">
            <span class="label">So tien co dinh</span>
            <strong>${formatMoney(transaction.amount)}</strong>
          </div>
          <div class="meta">
            <span class="label">Het han</span>
            <strong>${escapeHtml(
              new Date(transaction.expiredAt).toLocaleString('vi-VN')
            )}</strong>
          </div>
        </div>
        <h2>Danh sach ghe</h2>
        <ul>${seatList}</ul>
      </section>
      <section class="card">
        <div class="qr-box">${qrSvg}</div>
        <div class="receiver">
          <p><strong>Tai khoan nhan tien co dinh</strong></p>
          <p>${escapeHtml(receiverAccount.bankName)} - ${escapeHtml(
            receiverAccount.accountNo
          )}</p>
          <p>${escapeHtml(receiverAccount.accountName)}</p>
        </div>
        <form method="post" action="/mock-gateway/pay">
          <input type="hidden" name="paymentId" value="${escapeHtml(
            transaction.paymentId
          )}" />
          <input type="hidden" name="signature" value="${escapeHtml(signature)}" />
          <h2>Chon tai khoan chuyen tien mock</h2>
          ${accountOptions}
          <button type="submit">Xac nhan chuyen khoan</button>
        </form>
      </section>
    </main>
  </body>
  </html>`;
};

const assertGatewayBookingIsPayable = (booking) => {
  if (!booking) {
    throw ApiError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
  }

  if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
    throw ApiError.conflict(
      'Booking is not awaiting payment',
      'BOOKING_NOT_AWAITING_PAYMENT'
    );
  }

  if (
    booking.paymentStatus &&
    booking.paymentStatus !== PAYMENT_STATUS.PENDING
  ) {
    throw ApiError.conflict(
      'Booking payment status is no longer pending',
      'BOOKING_PAYMENT_STATUS_INVALID'
    );
  }

  if (
    booking.paymentExpiresAt &&
    new Date(booking.paymentExpiresAt).getTime() <= Date.now()
  ) {
    throw ApiError.conflict(
      'Booking payment window has expired',
      'BOOKING_PAYMENT_EXPIRED'
    );
  }
};

const postJson = (targetUrl, payload) =>
  new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const client = url.protocol === 'https:' ? https : http;
    const body = JSON.stringify(payload);
    const request = client.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let responseBody = '';

        response.on('data', (chunk) => {
          responseBody += chunk;
        });

        response.on('end', () => {
          let parsedBody = null;

          try {
            parsedBody = responseBody ? JSON.parse(responseBody) : null;
          } catch (error) {
            parsedBody = null;
          }

          resolve({
            statusCode: response.statusCode || 500,
            body: parsedBody,
            rawBody: responseBody,
          });
        });
      }
    );

    request.on('error', reject);
    request.write(body);
    request.end();
  });

const buildGatewayReturnUrl = (transaction, params) =>
  appendQueryParams(transaction.returnUrl, {
    paymentId: transaction.paymentId,
    bookingId: transaction.bookingId,
    ...params,
  });

const loadGatewayCheckout = async ({ paymentId, signature }) => {
  const transaction = await paymentService.getPaymentTransactionForGateway({
    paymentId,
    signature,
  });
  await paymentService.markGatewayOpened(transaction);

  const [booking, sourceAccounts] = await Promise.all([
    Booking.findById(transaction.bookingId)
      .select(
        '_id bookingCode seats totalAmount currency paymentExpiresAt status paymentStatus'
      )
      .lean()
      .exec(),
    MockBankAccount.find({
      status: MOCK_BANK_ACCOUNT_STATUS.ACTIVE,
      currency: transaction.currency,
    })
      .sort({ balance: -1, createdAt: 1 })
      .lean()
      .exec(),
  ]);

  if (!booking) {
    throw ApiError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
  }

  assertGatewayBookingIsPayable(booking);

  if (!sourceAccounts.length) {
    throw ApiError.internal(
      'No active mock bank accounts are available',
      'MOCK_BANK_ACCOUNT_NOT_AVAILABLE'
    );
  }

  return {
    transaction,
    booking,
    sourceAccounts,
    signature,
  };
};

const submitGatewayPayment = async ({ paymentId, signature, sourceAccountId }) => {
  const transaction = await paymentService.getPaymentTransactionForGateway({
    paymentId,
    signature,
  });

  if (transaction.status === PAYMENT_TRANSACTION_STATUS.CALLBACK_PENDING) {
    return buildGatewayReturnUrl(transaction, {
      status: 'processing',
      message: 'Payment callback is already processing',
    });
  }

  const booking = await Booking.findById(transaction.bookingId)
    .select('_id status paymentStatus paymentExpiresAt')
    .lean()
    .exec();
  assertGatewayBookingIsPayable(booking);

  const sourceAccount = await MockBankAccount.findOneAndUpdate(
    {
      _id: sourceAccountId,
      status: MOCK_BANK_ACCOUNT_STATUS.ACTIVE,
      currency: transaction.currency,
      balance: { $gte: transaction.amount },
    },
    {
      $inc: { balance: -transaction.amount },
      $set: { lastUsedAt: new Date() },
    },
    { new: true }
  ).exec();

  if (!sourceAccount) {
    throw ApiError.conflict(
      'Selected mock bank account has insufficient balance or is unavailable',
      'MOCK_BANK_ACCOUNT_INSUFFICIENT_BALANCE'
    );
  }

  const transactionCode = paymentService.createTransactionCode();
  const paidAt = new Date();

  transaction.status = PAYMENT_TRANSACTION_STATUS.CALLBACK_PENDING;
  transaction.sourceAccountId = sourceAccount._id;
  transaction.sourceAccount = {
    bankCode: sourceAccount.bankCode,
    bankName: sourceAccount.bankName,
    accountNo: sourceAccount.accountNo,
    accountName: sourceAccount.accountName,
  };
  transaction.transactionCode = transactionCode;
  transaction.paidAt = paidAt;
  transaction.failureReason = null;
  await transaction.save();

  const callbackPayload = buildCallbackPayload({
    transaction,
    transactionCode,
    paidAt,
    sourceAccountNo: sourceAccount.accountNo,
  });
  const { signature: callbackSignature } = signHmacSha256({
    payload: callbackPayload,
    fields: PAYMENT_CALLBACK_FIELDS,
    secret: env.paymentCallbackSecret,
    secretLabel: 'PAYMENT_CALLBACK_SECRET',
  });

  try {
    const callbackResponse = await postJson(transaction.callbackUrl, {
      ...callbackPayload,
      signature: callbackSignature,
    });

    const isSuccess =
      callbackResponse.statusCode >= 200 &&
      callbackResponse.statusCode < 300 &&
      callbackResponse.body &&
      callbackResponse.body.success === true;

    if (!isSuccess) {
      throw new Error(
        callbackResponse.body?.message ||
          callbackResponse.rawBody ||
          'Callback request failed'
      );
    }

    return buildGatewayReturnUrl(transaction, {
      status: 'success',
      transactionCode,
    });
  } catch (error) {
    const freshTransaction = await PaymentTransaction.findOne({
      paymentId: transaction.paymentId,
    }).exec();

    if (freshTransaction?.status === PAYMENT_TRANSACTION_STATUS.SUCCESS) {
      return buildGatewayReturnUrl(freshTransaction, {
        status: 'success',
        transactionCode: freshTransaction.transactionCode,
      });
    }

    await Promise.all([
      MockBankAccount.updateOne(
        { _id: sourceAccount._id },
        { $inc: { balance: transaction.amount } }
      ).exec(),
      PaymentTransaction.updateOne(
        { _id: transaction._id },
        {
          $set: {
            status: PAYMENT_TRANSACTION_STATUS.FAILED,
            failureReason: error.message,
          },
        }
      ).exec(),
    ]);

    return buildGatewayReturnUrl(transaction, {
      status: 'failed',
      transactionCode,
      message: error.message,
    });
  }
};

module.exports = {
  loadGatewayCheckout,
  submitGatewayPayment,
  renderGatewayCheckoutPage,
  renderGatewayErrorPage,
};
