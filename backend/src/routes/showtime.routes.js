const express = require('express');
const showtimeController = require('../controllers/showtime.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const showtimeValidation = require('../validations/showtime.validation');

const router = express.Router();

router.post(
  '/batch',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(showtimeValidation.createShowtimeScheduleSchema),
  showtimeController.createShowtimeSchedule
);
router.post(
  '/bulk-create',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(showtimeValidation.bulkCreateShowtimeSchema),
  showtimeController.bulkCreateShowtimes
);
router.post(
  '/',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(showtimeValidation.createShowtimeSchema),
  showtimeController.createShowtime
);
router.put(
  '/:id',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(showtimeValidation.updateShowtimeSchema),
  showtimeController.updateShowtime
);
router.delete(
  '/:id',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin'),
  validate(showtimeValidation.showtimeIdParamSchema),
  showtimeController.deleteShowtime
);
router.get('/', showtimeController.listShowtimes);
router.get('/:id', showtimeController.getShowtimeById);

module.exports = router;
