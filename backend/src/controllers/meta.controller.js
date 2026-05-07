const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const { CINEMA_BRANDS, VIETNAM_PROVINCES } = require('../constants/cinema.constants');
const { MOVIE_GENRES } = require('../constants/movie.constants');

/**
 * @desc    Get cinema options (brands, provinces)
 * @route   GET /api/v1/meta/cinema-options
 * @access  Public
 */
const getCinemaOptions = asyncHandler(async (req, res) => {
  return sendApiResponse(res, {
    message: 'Lấy tuỳ chọn rạp thành công',
    data: {
      brands: CINEMA_BRANDS,
      provinces: VIETNAM_PROVINCES
    },
  });
});

/**
 * @desc    Get movie options (genres)
 * @route   GET /api/v1/meta/movie-options
 * @access  Public
 */
const getMovieOptions = asyncHandler(async (req, res) => {
  return sendApiResponse(res, {
    message: 'Lấy tuỳ chọn phim thành công',
    data: {
      genres: MOVIE_GENRES
    },
  });
});

module.exports = {
  getCinemaOptions,
  getMovieOptions,
};
