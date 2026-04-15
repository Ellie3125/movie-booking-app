const mongoose = require('mongoose');
const Showtime = require('../models/Showtime');
const ApiError = require('../utils/apiError');

const SHOWTIME_LIST_FIELDS = [
  'movieId',
  'cinemaId',
  'roomId',
  'startTime',
  'endTime',
  'createdAt',
  'updatedAt',
].join(' ');

const SHOWTIME_POPULATE = [
  {
    path: 'movieId',
    select: 'title duration poster status',
  },
  {
    path: 'cinemaId',
    select: 'name brand city address',
  },
  {
    path: 'roomId',
    select: 'name screenLabel totalColumns',
  },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const validateObjectId = (id, resourceName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(
      `${resourceName} id is invalid`,
      'INVALID_OBJECT_ID'
    );
  }
};

const buildDateRange = (value) => {
  if (!DATE_PATTERN.test(value)) {
    throw ApiError.badRequest(
      'Date must use YYYY-MM-DD format',
      'INVALID_DATE'
    );
  }

  const [year, month, day] = value.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);

  if (
    Number.isNaN(start.getTime()) ||
    start.getFullYear() !== year ||
    start.getMonth() !== month - 1 ||
    start.getDate() !== day
  ) {
    throw ApiError.badRequest(
      'Date must be a valid calendar date',
      'INVALID_DATE'
    );
  }

  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

  return { start, end };
};

const mapShowtime = ({ movieId, cinemaId, roomId, ...showtime }) => ({
  ...showtime,
  movie: movieId,
  cinema: cinemaId,
  room: roomId,
});

const listShowtimes = async ({ movieId, cinemaId, date }) => {
  const filter = {};

  if (movieId) {
    validateObjectId(movieId, 'Movie');
    filter.movieId = movieId;
  }

  if (cinemaId) {
    validateObjectId(cinemaId, 'Cinema');
    filter.cinemaId = cinemaId;
  }

  if (date) {
    const { start, end } = buildDateRange(date);
    filter.startTime = { $gte: start, $lt: end };
  }

  const itemsQuery = Showtime.find(filter)
    .select(SHOWTIME_LIST_FIELDS)
    .sort({ startTime: 1 });

  SHOWTIME_POPULATE.forEach((populate) => {
    itemsQuery.populate(populate);
  });

  const [items, total] = await Promise.all([
    itemsQuery.lean(),
    Showtime.countDocuments(filter),
  ]);

  return {
    items: items.map(mapShowtime),
    total,
  };
};

const getShowtimeById = async (id) => {
  validateObjectId(id, 'Showtime');

  const query = Showtime.findById(id);

  SHOWTIME_POPULATE.forEach((populate) => {
    query.populate(populate);
  });

  const showtime = await query.lean();

  if (!showtime) {
    throw ApiError.notFound('Showtime not found', 'SHOWTIME_NOT_FOUND');
  }

  return mapShowtime(showtime);
};

module.exports = {
  listShowtimes,
  getShowtimeById,
};
