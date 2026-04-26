const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const showtimeService = require('../services/showtime.service');

const listShowtimes = asyncHandler(async (req, res) => {
  const data = await showtimeService.listShowtimes({
    movieId: req.query.movieId,
    cinemaId: req.query.cinemaId,
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

module.exports = {
  createShowtimeSchedule,
  listShowtimes,
  getShowtimeById,
};
