const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const movieService = require('../services/movie.service');

const listMovies = asyncHandler(async (req, res) => {
  const data = await movieService.listMovies({
    status: req.query.status,
  });

  return sendApiResponse(res, {
    message: 'Movies fetched successfully',
    data,
  });
});

const getMovieById = asyncHandler(async (req, res) => {
  const data = await movieService.getMovieById(req.params.id);

  return sendApiResponse(res, {
    message: 'Movie fetched successfully',
    data,
  });
});

module.exports = {
  listMovies,
  getMovieById,
};
