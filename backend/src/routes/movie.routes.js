const express = require('express');
const movieController = require('../controllers/movie.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const movieValidation = require('../validations/movie.validation');

const router = express.Router();

router.post(
  '/',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin', 'staff'),
  validate(movieValidation.createMovieSchema),
  movieController.createMovie
);
router.get('/', movieController.listMovies);
router.put(
  '/:id',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin', 'staff'),
  validate(movieValidation.updateMovieSchema),
  movieController.updateMovie
);
router.delete(
  '/:id',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin', 'staff'),
  validate(movieValidation.movieIdParamSchema),
  movieController.deleteMovie
);
router.get('/:id', movieController.getMovieById);

module.exports = router;
