const mongoose = require('mongoose');
const { Payment, Booking, Showtime } = require('../models');

const VALID_METHODS = ['momo', 'vnpay', 'zalopay', 'visa', 'mastercard', 'cash'];

exports.create = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { bookingId, method, transactionId, metadata } = req.body;

    if (!bookingId || !method)
      return res.status(400).json({ message: 'bookingId and method required' });
    if (!VALID_METHODS.includes(method))
      return res.status(400).json({ message: `method must be one of: ${VALID_METHODS.join(', ')}` });

    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 });
    if (booking.userId.toString() !== req.user._id.toString())
      throw Object.assign(new Error('Access denied'), { status: 403 });
    if (booking.status !== 'pending')
      throw Object.assign(new Error(`Booking is already ${booking.status}`), { status: 409 });
    if (new Date() > booking.expiresAt)
      throw Object.assign(new Error('Booking has expired'), { status: 410 });

    // Simulate payment gateway success
    // In production: call actual gateway API here, check response code
    const paymentSuccess = true;

    const payment = await Payment.create([{
      bookingId,
      userId:        req.user._id,
      amount:        booking.totalAmount,
      method,
      transactionId: transactionId || `TXN_${method.toUpperCase()}_${Date.now()}`,
      status:        paymentSuccess ? 'success' : 'failed',
      metadata:      metadata || { gateway: method.toUpperCase(), responseCode: '00' },
      paidAt:        paymentSuccess ? new Date() : undefined,
    }], { session });

    if (paymentSuccess) {
      // Confirm booking
      booking.status = 'confirmed';
      await booking.save({ session });

      // Mark seats as booked in showtime
      const showtime = await Showtime.findById(booking.showtimeId).session(session);
      if (showtime) {
        for (const seat of booking.seats) {
          showtime.seatAvailability.set(seat.seatKey, 'booked');
        }
        showtime.markModified('seatAvailability');

        // Check if all seats are now booked → sold_out
        const allBooked = [...showtime.seatAvailability.values()].every(v => v === 'booked');
        if (allBooked) showtime.status = 'sold_out';
        await showtime.save({ session });
      }
    }

    await session.commitTransaction();
    res.status(201).json({ data: payment[0] });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('bookingId');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.userId.toString() !== req.user._id.toString() && req.user.role === 'user')
      return res.status(403).json({ message: 'Access denied' });
    res.json({ data: payment });
  } catch (err) { next(err); }
};

exports.refund = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const payment = await Payment.findById(req.params.id).session(session);
    if (!payment) throw Object.assign(new Error('Payment not found'), { status: 404 });
    if (payment.status !== 'success')
      throw Object.assign(new Error('Only successful payments can be refunded'), { status: 409 });

    payment.status = 'refunded';
    await payment.save({ session });

    // Also cancel the associated booking and release seats
    const booking = await Booking.findById(payment.bookingId).session(session);
    if (booking && booking.status === 'confirmed') {
      booking.status = 'cancelled';
      await booking.save({ session });

      const showtime = await Showtime.findById(booking.showtimeId).session(session);
      if (showtime) {
        for (const seat of booking.seats) {
          showtime.seatAvailability.set(seat.seatKey, 'available');
        }
        showtime.markModified('seatAvailability');
        if (showtime.status === 'sold_out') showtime.status = 'open';
        await showtime.save({ session });
      }
    }

    await session.commitTransaction();
    res.json({ message: 'Payment refunded', data: payment });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.listAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.method) filter.method = req.query.method;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('userId', 'name email')
        .populate('bookingId', 'totalAmount seats status')
        .sort({ createdAt: -1 })
        .skip((page-1)*limit).limit(limit),
      Payment.countDocuments(filter),
    ]);

    res.json({ data: payments, pagination: { page, limit, total } });
  } catch (err) { next(err); }
};