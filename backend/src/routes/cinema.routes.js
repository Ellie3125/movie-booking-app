const express = require('express');
const cinemaController = require('../controllers/cinema.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const cinemaValidation = require('../validations/cinema.validation');

const router = express.Router();

router.get('/', cinemaController.listCinemas);
router.post(
  '/',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(cinemaValidation.createCinemaSchema),
  cinemaController.createCinema
);
router.get('/brands', cinemaController.listBrands);
router.get('/cities', cinemaController.listCities);
router.get(
  '/nearby',
  validate(cinemaValidation.nearbyQuerySchema),
  cinemaController.getNearbyCinemas
);
router.get('/:id', cinemaController.getCinemaById);
router.put(
  '/:id',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(cinemaValidation.updateCinemaSchema),
  cinemaController.updateCinema
);
router.patch(
  '/:id/location',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(cinemaValidation.updateLocationSchema),
  cinemaController.updateCinemaLocation
);
router.delete(
  '/:id',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(cinemaValidation.cinemaIdParamSchema),
  cinemaController.deleteCinema
);

module.exports = router;
