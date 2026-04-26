const express = require('express');
const showtimeController = require('../controllers/showtime.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const showtimeValidation = require('../validations/showtime.validation');

const router = express.Router();

router.post(
  '/batch',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin', 'staff'),
  validate(showtimeValidation.createShowtimeScheduleSchema),
  showtimeController.createShowtimeSchedule
);
router.get('/', showtimeController.listShowtimes);
router.get('/:id', showtimeController.getShowtimeById);

module.exports = router;
