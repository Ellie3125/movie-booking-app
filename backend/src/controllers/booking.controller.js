const mongoose = require('mongoose');
const QRCode   = require('qrcode');
const { Booking, Showtime, Screen } = require('../models');

exports.myBookings = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);

    const [bookings, total] = await Promise.all([
      Booking.find({ userId: req.user._id })
        .populate({ path: 'showtimeId', populate: [
          { path: 'movieId',  select: 'title posterUrl duration' },
          { path: 'screenId', populate: { path: 'cinemaId', select: 'name city' } },
        ]})
        .sort({ bookedAt: -1 })
        .skip((page-1)*limit).limit(limit),
      Booking.countDocuments({ userId: req.user._id }),
    ]);

    res.json({ data: bookings, pagination: { page, limit, total } });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'showtimeId', populate: [
        { path: 'movieId',  select: 'title posterUrl duration' },
        { path: 'screenId', populate: { path: 'cinemaId', select: 'name city' } },
      ]});

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Only owner or admin can view
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role === 'user')
      return res.status(403).json({ message: 'Access denied' });

    res.json({ data: booking });
  } catch (err) { next(err); }
};

// ─── Create booking (atomic seat lock) ───────────────────────────────────────
exports.create = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { showtimeId, seatKeys } = req.body;
    if (!showtimeId || !Array.isArray(seatKeys) || seatKeys.length === 0)
      return res.status(400).json({ message: 'showtimeId and seatKeys[] required' });

    // Fetch showtime with lock
    const showtime = await Showtime.findById(showtimeId).session(session);
    if (!showtime) throw Object.assign(new Error('Showtime not found'), { status: 404 });
    if (showtime.status !== 'open') throw Object.assign(new Error('Showtime not available'), { status: 409 });

    // Check seat availability
    const seatAvail = showtime.seatAvailability;
    for (const key of seatKeys) {
      const state = seatAvail.get(key);
      if (state !== 'available')
        throw Object.assign(new Error(`Seat ${key} is ${state || 'invalid'}`), { status: 409 });
    }

    // Get screen for seat types
    const screen = await Screen.findById(showtime.screenId).session(session);
    const seatTypeMap = Object.fromEntries(
      screen.seatLayout.map(s => [`${s.row}${s.number}`, s.type])
    );

    // Calculate total
    const seats = seatKeys.map(key => {
      const type  = seatTypeMap[key] || 'standard';
      const price = showtime.pricing[type] || showtime.pricing.standard;
      return { seatKey: key, type, price };
    });
    const totalAmount = seats.reduce((s, x) => s + x.price, 0);

    // Mark seats as 'held'
    for (const key of seatKeys) seatAvail.set(key, 'held');
    showtime.markModified('seatAvailability');
    await showtime.save({ session });

    // Create booking (expires in 15 min)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const [booking] = await Booking.create([{
      userId: req.user._id,
      showtimeId,
      seats,
      totalAmount,
      status: 'pending',
      qrCode: `QR_${Date.now()}_${req.user._id}`,
      bookedAt: new Date(),
      expiresAt,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ data: booking });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// ─── Cancel booking ───────────────────────────────────────────────────────────
exports.cancel = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 });
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role === 'user')
      throw Object.assign(new Error('Access denied'), { status: 403 });
    if (!['pending', 'confirmed'].includes(booking.status))
      throw Object.assign(new Error(`Cannot cancel booking with status: ${booking.status}`), { status: 409 });

    // Release seats
    const showtime = await Showtime.findById(booking.showtimeId).session(session);
    if (showtime) {
      for (const seat of booking.seats) {
        showtime.seatAvailability.set(seat.seatKey, 'available');
      }
      showtime.markModified('seatAvailability');

      // Recheck if sold_out status should be reverted
      const stillSoldOut = [...showtime.seatAvailability.values()].every(v => v === 'booked');
      if (!stillSoldOut && showtime.status === 'sold_out') showtime.status = 'open';
      await showtime.save({ session });
    }

    booking.status = 'cancelled';
    await booking.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Booking cancelled', data: booking });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

exports.getQR = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role === 'user')
      return res.status(403).json({ message: 'Access denied' });
    if (booking.status !== 'confirmed')
      return res.status(400).json({ message: 'QR only available for confirmed bookings' });

    const qrDataUrl = await QRCode.toDataURL(booking.qrCode);
    res.json({ qrCode: booking.qrCode, qrImage: qrDataUrl });
  } catch (err) { next(err); }
};

exports.listAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('userId', 'name email')
        .sort({ bookedAt: -1 })
        .skip((page-1)*limit).limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.json({ data: bookings, pagination: { page, limit, total } });
  } catch (err) { next(err); }
};