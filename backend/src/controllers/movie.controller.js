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

const createMovie = asyncHandler(async (req, res) => {
  const data = await movieService.createMovie(req.body);

  return sendApiResponse(res, {
    statusCode: 201,
    message: 'Movie created successfully',
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

const updateMovie = asyncHandler(async (req, res) => {
  const data = await movieService.updateMovie(req.params.id, req.body);

  return sendApiResponse(res, {
    message: 'Movie updated successfully',
    data,
  });
});

const deleteMovie = asyncHandler(async (req, res) => {
  await movieService.deleteMovie(req.params.id);

  return sendApiResponse(res, {
    message: 'Movie deleted successfully',
    data: null,
  });
});

module.exports = {
  createMovie,
  deleteMovie,
  listMovies,
  getMovieById,
  updateMovie,
};
