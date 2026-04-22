const { Room, Showtime } = require('../models');

// Build seat layout tự động từ rows × cols
const buildSeatLayout = (rows, cols, vipRows = 2) => {
  const layout = [];
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < rows; r++) {
    const rowLetter = ALPHA[r];
    const type = r < vipRows ? 'vip' : 'standard';
    for (let c = 1; c <= cols; c++) {
      layout.push({ row: rowLetter, number: c, type, position: [r, c - 1] });
    }
  }
  // Hàng cuối thêm ghế đôi
  const coupleRow = ALPHA[rows];
  for (let c = 1; c <= 4; c++) {
    layout.push({ row: coupleRow, number: c, type: 'couple', position: [rows, (c - 1) * 2] });
  }
  return layout;
};

exports.list = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.cinemaId) filter.cinemaId = req.query.cinemaId;
    if (req.query.type)     filter.screenType = req.query.type;

    const rooms = await Room.find(filter)
      .select('-seatLayout')
      .populate('cinemaId', 'name city')
      .sort({ name: 1 });

    res.json({ data: rooms });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('cinemaId', 'name city address');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ data: room });
  } catch (err) { next(err); }
};

exports.getShowtimes = async (req, res, next) => {
  try {
    const filter = { roomId: req.params.id, status: 'open' };
    if (req.query.date) {
      const d = new Date(req.query.date);
      const next = new Date(req.query.date); next.setDate(next.getDate() + 1);
      filter.startTime = { $gte: d, $lt: next };
    } else {
      filter.startTime = { $gte: new Date() };
    }

    const showtimes = await Showtime.find(filter)
      .populate('movieId', 'title posterUrl duration')
      .sort({ startTime: 1 });

    res.json({ data: showtimes });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { cinemaId, name, screenType, rows, cols, vipRows, seatLayout } = req.body;

    // Nếu không truyền seatLayout thì tự build từ rows × cols
    const layout = seatLayout || buildSeatLayout(
      rows || 10,
      cols || 12,
      vipRows || 2
    );
    const totalSeats = layout.length;

    const room = await Room.create({
      cinemaId, name, screenType: screenType || '2D',
      rows: rows || 10, cols: cols || 12,
      totalSeats, seatLayout: layout,
    });

    res.status(201).json({ data: room });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const allowed = ['name', 'screenType', 'isActive'];
    const updates = {};
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];

    const room = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ data: room });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    // Kiểm tra còn suất chiếu trong tương lai không
    const upcoming = await Showtime.countDocuments({
      roomId: req.params.id,
      startTime: { $gte: new Date() },
      status: { $ne: 'cancelled' },
    });
    if (upcoming > 0)
      return res.status(409).json({ message: `Cannot delete room with ${upcoming} upcoming showtimes` });

    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (err) { next(err); }
};