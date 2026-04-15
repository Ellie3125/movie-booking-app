const express = require('express');
const cinemaController = require('../controllers/cinema.controller');

const router = express.Router();

router.get('/', cinemaController.listCinemas);
router.get('/:id', cinemaController.getCinemaById);

module.exports = router;
