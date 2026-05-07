const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const {
  Movie,
  Cinema,
  Room,
  Showtime,
  User,
  Booking,
  Ticket,
} = require('../models');
const { PAYMENT_STATUS, BOOKING_STATUS } = require('../constants/payment.constants');

/**
 * GET /api/v1/dashboard/stats
 * Admin only — aggregate real data from MongoDB.
 */
const getDashboardStats = asyncHandler(async (_req, res) => {
  // ── 1. Simple counts ───────────────────────────────────────────────────────
  const [
    totalMovies,
    totalCinemas,
    totalRooms,
    totalShowtimes,
    totalUsers,
    totalBookings,
    totalTicketsSold,
  ] = await Promise.all([
    Movie.countDocuments().exec(),
    Cinema.countDocuments().exec(),
    Room.countDocuments().exec(),
    Showtime.countDocuments().exec(),
    User.countDocuments().exec(),
    Booking.countDocuments().exec(),
    Ticket.countDocuments().exec(),
  ]);

  // ── 2. Total revenue (only SUCCESS bookings) ───────────────────────────────
  const revenueAgg = await Booking.aggregate([
    { $match: { paymentStatus: PAYMENT_STATUS.SUCCESS } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total ?? 0;

  // ── 3. Booking status stats ────────────────────────────────────────────────
  const statusAgg = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const bookingStatusStats = {
    [BOOKING_STATUS.PENDING_PAYMENT]: 0,
    [BOOKING_STATUS.CONFIRMED]: 0,
    [BOOKING_STATUS.CANCELLED]: 0,
  };
  statusAgg.forEach(({ _id, count }) => {
    if (_id in bookingStatusStats) bookingStatusStats[_id] = count;
  });

  // ── 4. Revenue chart — last 12 months ─────────────────────────────────────
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const revenueChartRaw = await Booking.aggregate([
    {
      $match: {
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        createdAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Build a full 12-month array (fill gaps with 0)
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueChartMap = {};
  revenueChartRaw.forEach(({ _id, revenue, bookings }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
    revenueChartMap[key] = { revenue, bookings };
  });

  const revenueChart = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-indexed
    const key = `${year}-${String(month).padStart(2, '0')}`;
    revenueChart.push({
      month: MONTH_LABELS[month - 1],
      year,
      revenue: revenueChartMap[key]?.revenue ?? 0,
      bookings: revenueChartMap[key]?.bookings ?? 0,
    });
  }

  // ── 5. Top 5 movies ───────────────────────────────────────────────────────
  const topMoviesRaw = await Booking.aggregate([
    // Count all bookings per movie
    {
      $group: {
        _id: '$movieId',
        totalBookings: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ['$paymentStatus', PAYMENT_STATUS.SUCCESS] },
              '$totalAmount',
              0,
            ],
          },
        },
      },
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movie',
      },
    },
    { $unwind: { path: '$movie', preserveNullAndEmptyArrays: false } },
    {
      $project: {
        _id: 0,
        movieId: '$_id',
        title: '$movie.title',
        posterUrl: '$movie.posterUrl',
        totalBookings: 1,
        revenue: 1,
      },
    },
  ]);
  const topMovies = topMoviesRaw ?? [];

  // ── 6. Top 5 cinemas ──────────────────────────────────────────────────────
  // Booking has showtimeId → Showtime has cinemaId (direct field)
  const topCinemasRaw = await Booking.aggregate([
    {
      $lookup: {
        from: 'showtimes',
        localField: 'showtimeId',
        foreignField: '_id',
        as: 'showtime',
      },
    },
    { $unwind: { path: '$showtime', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: '$showtime.cinemaId',
        totalBookings: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [
              { $eq: ['$paymentStatus', PAYMENT_STATUS.SUCCESS] },
              '$totalAmount',
              0,
            ],
          },
        },
      },
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'cinemas',
        localField: '_id',
        foreignField: '_id',
        as: 'cinema',
      },
    },
    { $unwind: { path: '$cinema', preserveNullAndEmptyArrays: false } },
    {
      $project: {
        _id: 0,
        cinemaId: '$_id',
        name: '$cinema.name',
        province: '$cinema.province',
        totalBookings: 1,
        revenue: 1,
      },
    },
  ]);
  const topCinemas = topCinemasRaw ?? [];

  // ── Response ───────────────────────────────────────────────────────────────
  return apiResponse(res, {
    message: 'Dashboard stats fetched successfully',
    data: {
      summary: {
        totalMovies,
        totalCinemas,
        totalRooms,
        totalShowtimes,
        totalUsers,
        totalBookings,
        totalTicketsSold,
        totalRevenue,
      },
      bookingStatusStats,
      revenueChart,
      topMovies,
      topCinemas,
    },
  });
});

module.exports = { getDashboardStats };
