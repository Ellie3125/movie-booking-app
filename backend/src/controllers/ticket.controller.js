const { Ticket } = require('../models');

const POPULATE_TICKET = [
  { path: 'movieId',   select: 'title posterUrl duration' },
  { path: 'cinemaId',  select: 'name city address' },
  { path: 'roomId',    select: 'name screenType' },
  { path: 'showtimeId',select: 'startTime endTime language format' },
];

exports.myTickets = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const filter = { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate(POPULATE_TICKET)
        .sort({ issuedAt: -1 })
        .skip((page - 1) * limit).limit(limit),
      Ticket.countDocuments(filter),
    ]);

    res.json({ data: tickets, pagination: { page, limit, total } });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(POPULATE_TICKET);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const isOwner = ticket.userId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role === 'user')
      return res.status(403).json({ message: 'Access denied' });

    res.json({ data: ticket });
  } catch (err) { next(err); }
};

exports.byBooking = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ bookingId: req.params.bookingId })
      .populate(POPULATE_TICKET)
      .sort({ seatKey: 1 });

    if (tickets.length && tickets[0].userId.toString() !== req.user._id.toString() && req.user.role === 'user')
      return res.status(403).json({ message: 'Access denied' });

    res.json({ data: tickets });
  } catch (err) { next(err); }
};

// Staff quét mã QR tại rạp
exports.verify = async (req, res, next) => {
  try {
    const { ticketCode } = req.body;
    if (!ticketCode && !req.params.id)
      return res.status(400).json({ message: 'ticketCode required' });

    const ticket = ticketCode
      ? await Ticket.findOne({ ticketCode })
      : await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.status === 'used')
      return res.status(409).json({ message: 'Ticket already used', usedAt: ticket.usedAt });
    if (ticket.status === 'cancelled')
      return res.status(409).json({ message: 'Ticket is cancelled' });

    // Kiểm tra suất chiếu chưa quá 30 phút
    const showtime = ticket.snapshot?.startTime;
    if (showtime) {
      const now = Date.now();
      const diff = now - new Date(showtime).getTime();
      if (diff > 30 * 60 * 1000)
        return res.status(410).json({ message: 'Showtime has already passed' });
    }

    ticket.status = 'used';
    ticket.usedAt = new Date();
    await ticket.save();

    res.json({ message: 'Ticket verified successfully', data: ticket });
  } catch (err) { next(err); }
};

exports.listAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const filter = {};
    if (req.query.status)     filter.status     = req.query.status;
    if (req.query.showtimeId) filter.showtimeId = req.query.showtimeId;
    if (req.query.cinemaId)   filter.cinemaId   = req.query.cinemaId;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate('userId', 'name email')
        .populate('movieId', 'title')
        .sort({ issuedAt: -1 })
        .skip((page - 1) * limit).limit(limit),
      Ticket.countDocuments(filter),
    ]);

    res.json({ data: tickets, pagination: { page, limit, total } });
  } catch (err) { next(err); }
};