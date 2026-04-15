const express = require('express');
const showtimeController = require('../controllers/showtime.controller');

const router = express.Router();

router.get('/', showtimeController.listShowtimes);
router.get('/:id', showtimeController.getShowtimeById);

module.exports = router;
