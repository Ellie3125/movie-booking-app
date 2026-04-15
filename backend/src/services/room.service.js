const mongoose = require('mongoose');
const Room = require('../models/Room');
const ApiError = require('../utils/apiError');

const ROOM_LIST_FIELDS = [
  'cinemaId',
  'name',
  'screenLabel',
  'totalRows',
  'totalColumns',
  'activeSeatCount',
  'createdAt',
  'updatedAt',
].join(' ');

const validateObjectId = (id, resourceName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(
      `${resourceName} id is invalid`,
      'INVALID_OBJECT_ID'
    );
  }
};

const listRooms = async ({ cinemaId }) => {
  const filter = {};

  if (cinemaId) {
    validateObjectId(cinemaId, 'Cinema');
    filter.cinemaId = cinemaId;
  }

  const [items, total] = await Promise.all([
    Room.find(filter).select(ROOM_LIST_FIELDS).sort({ name: 1 }).lean(),
    Room.countDocuments(filter),
  ]);

  return { items, total };
};

const getRoomById = async (id) => {
  validateObjectId(id, 'Room');

  const room = await Room.findById(id).lean();

  if (!room) {
    throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }

  return room;
};

module.exports = {
  listRooms,
  getRoomById,
};
