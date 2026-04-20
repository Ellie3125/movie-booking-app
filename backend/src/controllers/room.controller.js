const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const roomService = require('../services/room.service');

const listRooms = asyncHandler(async (req, res) => {
  const data = await roomService.listRooms({
    cinemaId: req.query.cinemaId,
  });

  return sendApiResponse(res, {
    message: 'Rooms fetched successfully',
    data,
  });
});

const createRoom = asyncHandler(async (req, res) => {
  const data = await roomService.createRoom(req.body);

  return sendApiResponse(res, {
    statusCode: 201,
    message: 'Room created successfully',
    data,
  });
});

const getRoomById = asyncHandler(async (req, res) => {
  const data = await roomService.getRoomById(req.params.id);

  return sendApiResponse(res, {
    message: 'Room fetched successfully',
    data,
  });
});

const updateRoom = asyncHandler(async (req, res) => {
  const data = await roomService.updateRoom(req.params.id, req.body);

  return sendApiResponse(res, {
    message: 'Room updated successfully',
    data,
  });
});

const deleteRoom = asyncHandler(async (req, res) => {
  await roomService.deleteRoom(req.params.id);

  return sendApiResponse(res, {
    message: 'Room deleted successfully',
    data: null,
  });
});

module.exports = {
  createRoom,
  deleteRoom,
  listRooms,
  getRoomById,
  updateRoom,
};
