const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
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

const normalizeStringList = (items = []) =>
  [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];

const buildMoviePayload = (payload) => ({
  title: payload.title.trim(),
  description: payload.description?.trim() || '',
  duration: payload.duration,
  genre: normalizeStringList(payload.genre),
  poster: payload.poster?.trim() || '',
  releaseDate: new Date(payload.releaseDate),
  status: payload.status,
  language: payload.language?.trim() || 'Phụ đề',
  rating: payload.rating?.trim() || 'T13',
  formats: normalizeStringList(payload.formats).length
    ? normalizeStringList(payload.formats)
    : ['2D'],
  featuredNote: payload.featuredNote?.trim() || '',
});

const getMovieById = async (id) => {
  validateObjectId(id, 'Movie');

  const movie = await Movie.findById(id).lean();

  if (!movie) {
    throw ApiError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
  }

  return movie;
};

const createMovie = async (payload) => {
  const movie = await Movie.create(buildMoviePayload(payload));

  return movie.toObject();
};

const updateMovie = async (id, payload) => {
  validateObjectId(id, 'Movie');

  const movie = await Movie.findById(id).exec();

  if (!movie) {
    throw ApiError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
  }

  Object.assign(movie, buildMoviePayload(payload));
  await movie.save();

  return movie.toObject();
};

const deleteMovie = async (id) => {
  validateObjectId(id, 'Movie');

  const movie = await Movie.findById(id).select('_id').lean().exec();

  if (!movie) {
    throw ApiError.notFound('Movie not found', 'MOVIE_NOT_FOUND');
  }

  const hasShowtimes = await Showtime.exists({ movieId: id });

  if (hasShowtimes) {
    throw ApiError.conflict(
      'Cannot delete a movie that still has showtimes',
      'MOVIE_HAS_SHOWTIMES'
    );
  }

  await Movie.deleteOne({ _id: id }).exec();
};

module.exports = {
  createMovie,
  deleteMovie,
  listMovies,
  getMovieById,
  updateMovie,
};
