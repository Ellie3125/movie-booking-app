const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const ApiError = require('../utils/apiError');

const validateObjectId = (id, resourceName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(
      `${resourceName} id is invalid`,
      'INVALID_OBJECT_ID'
    );
  }
};

const validateStatus = (status) => {
  const allowedStatuses = Movie.schema.path('status').enumValues;

  if (status && !allowedStatuses.includes(status)) {
    throw ApiError.badRequest(
      `Movie status must be one of: ${allowedStatuses.join(', ')}`,
      'INVALID_MOVIE_STATUS'
    );
  }
};

const listMovies = async ({ status }) => {
  validateStatus(status);

  const filter = {};

  if (status) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Movie.find(filter).sort({ releaseDate: -1 }).lean(),
    Movie.countDocuments(filter),
  ]);

  return { items, total };
};

const getMovieById = async (id) => {
  validateObjectId(id, 'Movie');

  const movie = await Movie.findById(id).lean();

  if (!movie) {
    throw ApiError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
  }

  return movie;
};

module.exports = {
  listMovies,
  getMovieById,
};
