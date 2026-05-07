const express = require('express');
const router = express.Router();
const metaController = require('../controllers/meta.controller');

router.get('/cinema-options', metaController.getCinemaOptions);
router.get('/movie-options', metaController.getMovieOptions);

module.exports = router;
