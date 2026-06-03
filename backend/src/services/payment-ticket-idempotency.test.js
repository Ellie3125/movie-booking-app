const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const originalMongoUri = process.env.MONGODB_URI;
process.env.MONGODB_URI = originalMongoUri
  ? originalMongoUri.replace(/\/([^/?]+)(\?.*)?$/, '/movie_booking_app_ticket_idempotency_test$2')
  : 'mongodb://127.0.0.1:27017/movie_booking_app_ticket_idempotency_test';

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Cinema = require('../models/Cinema');
const Movie = require('../models/Movie');
const Room = require('../models/Room');
const Showtime = require('../models/Showtime');
const Ticket = require('../models/Ticket');
const PaymentTransaction = require('../models/PaymentTransaction');
const PaymentCallbackLog = require('../models/PaymentCallbackLog');
const paymentService = require('./payment.service');
const env = require('../config/env');
const { signHmacSha256 } = require('../utils/paymentHmac');
const {
  BOOKED_SEAT_STATUS,
  BOOKING_STATUS,
  PAYMENT_CALLBACK_FIELDS,
  PAYMENT_CURRENCY,
  PAYMENT_STATUS,
  PAYMENT_TRANSACTION_STATUS,
  SHOWTIME_SEAT_STATUS,
  TICKET_STATUS,
} = require('../constants/payment.constants');

const objectId = () => new mongoose.Types.ObjectId();

const receiverAccount = {
  bankCode: 'VCB',
  bankName: 'Vietcombank',
  accountNo: '1900100009999',
  accountName: 'BEAT CINEMA RECEIVER',
};

const ticketPayload = ({ bookingId, seatCode, ticketCode }) => ({
  bookingId,
  userId: objectId(),
  movieId: objectId(),
  showtimeId: objectId(),
  roomId: objectId(),
  seat: {
    seatCode,
    seatLabel: seatCode,
    seatType: 'regular',
  },
  price: 90000,
  ticketCode,
  status: TICKET_STATUS.ISSUED,
  issuedAt: new Date('2026-05-01T00:00:00.000Z'),
});

test.before(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

test.beforeEach(async () => {
  await mongoose.connection.dropDatabase();
  await Promise.all([
    Booking.syncIndexes(),
    Cinema.syncIndexes(),
    Movie.syncIndexes(),
    Room.syncIndexes(),
    Showtime.syncIndexes(),
    Ticket.syncIndexes(),
    PaymentTransaction.syncIndexes(),
    PaymentCallbackLog.syncIndexes(),
  ]);
});

test.after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('Ticket unique indexes allow one booking to have multiple seat tickets', async () => {
  const bookingId = objectId();

  await Ticket.create(ticketPayload({ bookingId, seatCode: 'A1', ticketCode: 'T-A1' }));
  await Ticket.create(ticketPayload({ bookingId, seatCode: 'A2', ticketCode: 'T-A2' }));

  const count = await Ticket.countDocuments({ bookingId });
  assert.equal(count, 2);
});

test('Ticket unique indexes reject duplicate booking seat pairs', async () => {
  const bookingId = objectId();

  await Ticket.create(ticketPayload({ bookingId, seatCode: 'A1', ticketCode: 'T-A1' }));

  await assert.rejects(
    Ticket.create(ticketPayload({ bookingId, seatCode: 'A1', ticketCode: 'T-A1-RETRY' })),
    /E11000/
  );
});

test('Ticket unique indexes reject duplicate ticketCode globally', async () => {
  await Ticket.create(ticketPayload({ bookingId: objectId(), seatCode: 'A1', ticketCode: 'T-DUP' }));

  await assert.rejects(
    Ticket.create(ticketPayload({ bookingId: objectId(), seatCode: 'B1', ticketCode: 'T-DUP' })),
    /E11000/
  );
});

test('SUCCESS payment callback is idempotent and does not duplicate tickets', async () => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
  const paidAt = new Date(now.getTime() + 60 * 1000);
  const bookingId = objectId();
  const userId = objectId();
  const movieId = objectId();
  const cinemaId = objectId();
  const roomId = objectId();
  const showtimeId = objectId();

  await Movie.create({
    _id: movieId,
    title: 'Idempotent Ticket Movie',
    duration: 120,
    releaseDate: new Date('2026-04-01T00:00:00.000Z'),
    endDate: new Date('2026-06-01T00:00:00.000Z'),
    status: 'now_showing',
  });

  await Cinema.create({
    _id: cinemaId,
    name: 'Idempotent Cinema',
    brandId: objectId(),
    brand: 'TEST',
    province: 'TP. Hồ Chí Minh',
    address: '1 Test Street',
    location: {
      type: 'Point',
      coordinates: [106.700981, 10.776889],
    },
  });

  await Room.create({
    _id: roomId,
    cinemaId,
    name: 'Room 1',
    seatLayout: [
      {
        rowLabel: 'A',
        seats: ['A1', 'A2'].map((seatCode, index) => ({
          seatCode,
          label: seatCode,
          rowLabel: 'A',
          rowIndex: 0,
          columnIndex: index,
          type: 'regular',
          status: 'active',
          priceType: 'regular',
          capacity: 1,
        })),
      },
    ],
  });

  await Showtime.create({
    _id: showtimeId,
    movieId,
    cinemaId,
    roomId,
    startTime: new Date('2026-05-02T00:00:00.000Z'),
    endTime: new Date('2026-05-02T02:00:00.000Z'),
    price: 90000,
    status: 'active',
    seatStates: ['A1', 'A2'].map((seatCode, index) => ({
      seatCode,
      label: seatCode,
      rowLabel: 'A',
      rowIndex: 0,
      columnIndex: index,
      type: 'regular',
      capacity: 1,
      status: SHOWTIME_SEAT_STATUS.HELD,
      userId,
      bookingId,
      heldAt: now,
      holdExpiresAt: expiresAt,
    })),
  });

  await Booking.create({
    _id: bookingId,
    userId,
    movieId,
    showtimeId,
    roomId,
    seats: ['A1', 'A2'].map((seatCode) => ({
      seatCode,
      seatLabel: seatCode,
      seatType: 'regular',
      status: BOOKED_SEAT_STATUS.PENDING_PAYMENT,
      price: 90000,
    })),
    totalAmount: 180000,
    status: BOOKING_STATUS.PENDING_PAYMENT,
    paymentStatus: PAYMENT_STATUS.PENDING,
    currency: PAYMENT_CURRENCY.VND,
    paymentExpiresAt: expiresAt,
  });

  await PaymentTransaction.create({
    bookingId,
    userId,
    paymentId: 'PAY-IDEMPOTENT-1',
    amount: 180000,
    currency: PAYMENT_CURRENCY.VND,
    status: PAYMENT_TRANSACTION_STATUS.PENDING,
    receiverAccount,
    requestSignature: {
      canonicalString: 'request',
      signature: '0'.repeat(64),
      fields: [],
    },
    callbackUrl: 'http://localhost/api/v1/payments/callback',
    returnUrl: 'movie://payment/result',
    paymentUrl: 'http://localhost/gateway/pay/PAY-IDEMPOTENT-1',
    expiredAt: expiresAt,
  });

  const callbackPayload = {
    paymentId: 'PAY-IDEMPOTENT-1',
    bookingId: String(bookingId),
    paidAmount: 180000,
    currency: PAYMENT_CURRENCY.VND,
    transactionCode: 'TXN-IDEMPOTENT-1',
    status: 'SUCCESS',
    paidAt: paidAt.toISOString(),
    sourceAccountNo: '0011223344',
    receiverAccountNo: receiverAccount.accountNo,
  };
  const { signature } = signHmacSha256({
    payload: callbackPayload,
    fields: PAYMENT_CALLBACK_FIELDS,
    secret: env.paymentCallbackSecret,
  });

  await paymentService.handlePaymentCallback({ ...callbackPayload, signature });
  await paymentService.handlePaymentCallback({ ...callbackPayload, signature });

  const tickets = await Ticket.find({ bookingId }).sort({ 'seat.seatCode': 1 }).lean().exec();

  assert.equal(tickets.length, 2);
  assert.deepEqual(tickets.map((ticket) => ticket.seat.seatCode), ['A1', 'A2']);
});
