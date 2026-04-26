const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Room = require('../models/Room');
const Showtime = require('../models/Showtime');
const ApiError = require('../utils/apiError');
const { buildShowtimeSeatStatesFromRoomLayout } = require('../utils/roomLayout');

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
    select: 'title duration poster status language formats rating featuredNote',
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
const DAY_START_MINUTE = 8 * 60;
const DAY_END_MINUTE = 23 * 60 + 45;
const SLOT_STEP_MINUTES = 15;
const CLEANUP_BUFFER_MINUTES = 20;
const MAX_SCHEDULE_DAYS = 90;
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const validateObjectId = (id, resourceName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(
      `${resourceName} id is invalid`,
      'INVALID_OBJECT_ID'
    );
  }
};

const applyShowtimePopulate = (query) => {
  SHOWTIME_POPULATE.forEach((populate) => {
    query.populate(populate);
  });

  return query;
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

const buildDayStartTime = (dayStart, minuteOfDay) =>
  new Date(dayStart.getTime() + minuteOfDay * MS_PER_MINUTE);

const shuffleArray = (items) => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = nextItems[index];

    nextItems[index] = nextItems[randomIndex];
    nextItems[randomIndex] = current;
  }

  return nextItems;
};

const hasScheduleConflict = (candidateStart, candidateEnd, intervals) =>
  intervals.some((interval) => {
    const intervalStart = new Date(interval.startTime).getTime();
    const intervalEnd = new Date(interval.endTime).getTime();

    return (
      candidateStart.getTime() < intervalEnd + CLEANUP_BUFFER_MINUTES * MS_PER_MINUTE &&
      intervalStart < candidateEnd.getTime() + CLEANUP_BUFFER_MINUTES * MS_PER_MINUTE
    );
  });

const buildCandidateStartTimes = (dayStart, durationMinutes) => {
  const latestStartMinute =
    DAY_END_MINUTE - durationMinutes - CLEANUP_BUFFER_MINUTES;

  if (latestStartMinute < DAY_START_MINUTE) {
    return [];
  }

  const candidates = [];

  for (
    let minuteOfDay = DAY_START_MINUTE;
    minuteOfDay <= latestStartMinute;
    minuteOfDay += SLOT_STEP_MINUTES
  ) {
    candidates.push(buildDayStartTime(dayStart, minuteOfDay));
  }

  return candidates;
};

const pickRandomDaySchedule = ({
  dayStart,
  existingIntervals,
  showsPerDay,
  durationMinutes,
}) => {
  const candidates = buildCandidateStartTimes(dayStart, durationMinutes);

  if (candidates.length === 0) {
    return null;
  }

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const selectedStartTimes = [];
    const intervals = [...existingIntervals];

    for (const candidateStart of shuffleArray(candidates)) {
      const candidateEnd = new Date(
        candidateStart.getTime() + durationMinutes * MS_PER_MINUTE
      );

      if (hasScheduleConflict(candidateStart, candidateEnd, intervals)) {
        continue;
      }

      selectedStartTimes.push(candidateStart);
      intervals.push({
        startTime: candidateStart,
        endTime: candidateEnd,
      });

      if (selectedStartTimes.length === showsPerDay) {
        return selectedStartTimes.sort(
          (first, second) => first.getTime() - second.getTime()
        );
      }
    }
  }

  return null;
};

const ensureMovieExists = async (movieId) => {
  validateObjectId(movieId, 'Movie');

  const movie = await Movie.findById(movieId)
    .select('duration')
    .lean()
    .exec();

  if (!movie) {
    throw ApiError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
  }

  return movie;
};

const ensureCinemaExists = async (cinemaId) => {
  validateObjectId(cinemaId, 'Cinema');

  const cinema = await Cinema.findById(cinemaId).select('_id').lean().exec();

  if (!cinema) {
    throw ApiError.notFound('Cinema not found', 'CINEMA_NOT_FOUND');
  }
};

const ensureRoomExists = async (roomId, cinemaId) => {
  validateObjectId(roomId, 'Room');

  const room = await Room.findById(roomId)
    .select('cinemaId seatLayout')
    .lean()
    .exec();

  if (!room) {
    throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }

  if (String(room.cinemaId) !== String(cinemaId)) {
    throw ApiError.badRequest(
      'Selected room does not belong to the selected cinema',
      'ROOM_CINEMA_MISMATCH'
    );
  }

  return room;
};

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

  const itemsQuery = applyShowtimePopulate(
    Showtime.find(filter).select(SHOWTIME_LIST_FIELDS).sort({ startTime: 1 })
  );

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

  const showtime = await applyShowtimePopulate(Showtime.findById(id)).lean().exec();

  if (!showtime) {
    throw ApiError.notFound('Showtime not found', 'SHOWTIME_NOT_FOUND');
  }

  return mapShowtime(showtime);
};

const createShowtimeSchedule = async (payload) => {
  await ensureCinemaExists(payload.cinemaId);
  const movie = await ensureMovieExists(payload.movieId);
  const room = await ensureRoomExists(payload.roomId, payload.cinemaId);
  const startRange = buildDateRange(payload.startDate);
  const endRange = buildDateRange(payload.endDate);

  if (endRange.start.getTime() < startRange.start.getTime()) {
    throw ApiError.badRequest(
      'End date must be on or after start date',
      'INVALID_DATE_RANGE'
    );
  }

  const daysCount = Math.round(
    (endRange.end.getTime() - startRange.start.getTime()) / MS_PER_DAY
  );

  if (daysCount > MAX_SCHEDULE_DAYS) {
    throw ApiError.badRequest(
      `Schedule range cannot exceed ${MAX_SCHEDULE_DAYS} days`,
      'SHOWTIME_RANGE_TOO_LARGE'
    );
  }

  const existingShowtimes = await Showtime.find({
    roomId: room._id,
    startTime: { $lt: endRange.end },
    endTime: { $gt: startRange.start },
  })
    .select('startTime endTime')
    .lean()
    .exec();

  const durationMinutes = movie.duration;
  const showtimesToCreate = [];

  for (
    let dayStart = new Date(startRange.start);
    dayStart.getTime() < endRange.end.getTime();
    dayStart = new Date(dayStart.getTime() + MS_PER_DAY)
  ) {
    const nextDayStart = new Date(dayStart.getTime() + MS_PER_DAY);
    const existingIntervals = existingShowtimes.filter(
      (showtime) =>
        new Date(showtime.startTime).getTime() < nextDayStart.getTime() &&
        new Date(showtime.endTime).getTime() > dayStart.getTime()
    );
    const daySchedule = pickRandomDaySchedule({
      dayStart,
      existingIntervals,
      showsPerDay: payload.showsPerDay,
      durationMinutes,
    });

    if (!daySchedule) {
      const dateLabel = dayStart.toISOString().slice(0, 10);

      throw ApiError.conflict(
        `Không đủ khung giờ trống để tạo ${payload.showsPerDay} suất vào ngày ${dateLabel}`,
        'SHOWTIME_SCHEDULE_CONFLICT'
      );
    }

    daySchedule.forEach((startTime) => {
      showtimesToCreate.push({
        movieId: payload.movieId,
        cinemaId: payload.cinemaId,
        roomId: payload.roomId,
        startTime,
        endTime: new Date(startTime.getTime() + durationMinutes * MS_PER_MINUTE),
        seatStates: buildShowtimeSeatStatesFromRoomLayout(room.seatLayout),
      });
    });
  }

  const createdShowtimes = await Showtime.insertMany(showtimesToCreate);
  const createdIds = createdShowtimes.map((showtime) => showtime._id);
  const items = await applyShowtimePopulate(
    Showtime.find({ _id: { $in: createdIds } }).sort({ startTime: 1 })
  )
    .lean()
    .exec();

  return {
    createdCount: items.length,
    items: items.map(mapShowtime),
  };
};

module.exports = {
  createShowtimeSchedule,
  getShowtimeById,
  listShowtimes,
};
