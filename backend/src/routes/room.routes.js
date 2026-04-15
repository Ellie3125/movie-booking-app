const express = require('express');
const roomController = require('../controllers/room.controller');

const router = express.Router();

router.get('/', roomController.listRooms);
router.get('/:id', roomController.getRoomById);

module.exports = router;
