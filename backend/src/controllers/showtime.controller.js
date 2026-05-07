const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const showtimeService = require('../services/showtime.service');

const listShowtimes = asyncHandler(async (req, res) => {
  const data = await showtimeService.listShowtimes({
    movieId: req.query.movieId,
    cinemaId: req.query.cinemaId,
    roomId: req.query.roomId,
    date: req.query.date,
  });

  return sendApiResponse(res, {
    message: 'Showtimes fetched successfully',
    data,
  });
});

const createShowtimeSchedule = asyncHandler(async (req, res) => {
  const data = await showtimeService.createShowtimeSchedule(req.body);

  return sendApiResponse(res, {
    statusCode: 201,
    message: 'Showtime schedule created successfully',
    data,
  });
});

const getShowtimeById = asyncHandler(async (req, res) => {
  const data = await showtimeService.getShowtimeById(req.params.id);

  return sendApiResponse(res, {
    message: 'Showtime fetched successfully',
    data,
  });
});

const bulkCreateShowtimes = asyncHandler(async (req, res) => {
  const data = await showtimeService.bulkCreateShowtimes(req.body);

  return sendApiResponse(res, {
    statusCode: 201,
    message: req.body.dryRun ? 'Bulk showtime preview generated' : 'Bulk showtimes created successfully',
    data,
  });
});

const createShowtime = asyncHandler(async (req, res) => {
  const data = await showtimeService.createShowtime(req.body);
  return sendApiResponse(res, {
    statusCode: 201,
    message: 'Showtime created successfully',
    data,
  });
});

const updateShowtime = asyncHandler(async (req, res) => {
  const data = await showtimeService.updateShowtime(req.params.id, req.body);
  return sendApiResponse(res, {
    message: 'Showtime updated successfully',
    data,
  });
});

const deleteShowtime = asyncHandler(async (req, res) => {
  await showtimeService.deleteShowtime(req.params.id);
  return sendApiResponse(res, {
    message: 'Showtime deleted successfully',
    data: null,
  });
});

module.exports = {
  createShowtimeSchedule,
  listShowtimes,
  getShowtimeById,
  bulkCreateShowtimes,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
