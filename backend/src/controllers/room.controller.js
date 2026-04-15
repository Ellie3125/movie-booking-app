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

const getRoomById = asyncHandler(async (req, res) => {
  const data = await roomService.getRoomById(req.params.id);

  return sendApiResponse(res, {
    message: 'Room fetched successfully',
    data,
  });
});

module.exports = {
  listRooms,
  getRoomById,
};
