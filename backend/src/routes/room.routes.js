const express = require('express');
const roomController = require('../controllers/room.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const roomValidation = require('../validations/room.validation');

const router = express.Router();

router.post(
  '/',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin', 'staff'),
  validate(roomValidation.createRoomSchema),
  roomController.createRoom
);
router.get('/', roomController.listRooms);
router.put(
  '/:id',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin', 'staff'),
  validate(roomValidation.updateRoomSchema),
  roomController.updateRoom
);
router.delete(
  '/:id',
  authMiddleware.verifyAccessToken,
  authMiddleware.requireRole('admin', 'staff'),
  validate(roomValidation.roomIdParamSchema),
  roomController.deleteRoom
);
router.get('/:id', roomController.getRoomById);

module.exports = router;
