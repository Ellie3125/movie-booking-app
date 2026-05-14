const fs = require('fs');
const path = require('path');
const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const { CINEMA_BRANDS, VIETNAM_PROVINCES } = require('../constants/cinema.constants');
const { MOVIE_GENRES } = require('../constants/movie.constants');
const CinemaBrand = require('../models/CinemaBrand');

/**
 * @desc    Get cinema options (brands, provinces)
 * @route   GET /api/v1/meta/cinema-options
 * @access  Public
 */
const getCinemaOptions = asyncHandler(async (req, res) => {
  const brandsFromDb = await CinemaBrand.find({ status: 'active' }).sort({ name: 1 }).lean();
  
  return sendApiResponse(res, {
    message: 'Lấy tuỳ chọn rạp thành công',
    data: {
      brands: brandsFromDb.length > 0 ? brandsFromDb : CINEMA_BRANDS,
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

/**
 * @desc    Get available avatars
 * @route   GET /api/v1/meta/avatars
 * @access  Public
 */
const getAvatars = asyncHandler(async (req, res) => {
  const avatarDir = path.join(__dirname, '../../public/uploads/avatars');
  const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

  try {
    const files = await fs.promises.readdir(avatarDir);
    const avatars = files
      .filter((file) => validExtensions.includes(path.extname(file).toLowerCase()))
      .map((file) => ({
        name: file,
        url: `/uploads/avatars/${file}`,
      }));

    return sendApiResponse(res, {
      message: 'Lấy danh sách avatar thành công',
      data: avatars,
    });
  } catch (error) {
    return sendApiResponse(res, {
      message: 'Không thể lấy danh sách avatar',
      data: [],
    });
  }
});

module.exports = {
  getCinemaOptions,
  getMovieOptions,
  getAvatars,
};
