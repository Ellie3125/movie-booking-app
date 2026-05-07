const mongoose = require('mongoose');
const Room = require('../models/Room');
const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');
const ApiError = require('../utils/apiError');
const {
  buildShowtimeSeatStatesFromRoomLayout,
  createSeatLayout,
  extractSeatTypeOverrides,
  flattenRoomSeats,
} = require('../utils/roomLayout');
const { validateSeatLayout } = require('../utils/seatMerge');

const ROOM_LIST_FIELDS = [
  'cinemaId',
  'name',
  'roomType',
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

const ensureCinemaExists = async (cinemaId) => {
  validateObjectId(cinemaId, 'Cinema');

  const cinema = await Cinema.findById(cinemaId).select('_id').lean().exec();

  if (!cinema) {
    throw ApiError.notFound('Cinema not found', 'CINEMA_NOT_FOUND');
  }
};

const normalizeHiddenCoordinates = (hiddenCoordinates = []) =>
  [...new Set(hiddenCoordinates.map((coordinate) => coordinate.toUpperCase()))];

const parseSeatCoordinate = (coordinate) => {
  const normalizedCoordinate = String(coordinate).trim().toUpperCase();
  const match = normalizedCoordinate.match(/^([A-Z])(\d+)$/);

  if (!match) {
    return null;
  }

  return {
    coordinate: normalizedCoordinate,
    rowIndex: match[1].charCodeAt(0) - 65,
    columnNumber: Number(match[2]),
  };
};

const findOuterColumnHiddenCoordinates = ({
  totalRows,
  totalColumns,
  hiddenCoordinates = [],
}) =>
  normalizeHiddenCoordinates(hiddenCoordinates).filter((coordinate) => {
    const parsedCoordinate = parseSeatCoordinate(coordinate);

    if (!parsedCoordinate) {
      return false;
    }

    const withinRowRange =
      parsedCoordinate.rowIndex >= 0 && parsedCoordinate.rowIndex < totalRows;
    const withinColumnRange =
      parsedCoordinate.columnNumber >= 1 &&
      parsedCoordinate.columnNumber <= totalColumns;

    return (
      withinRowRange &&
      withinColumnRange &&
      (parsedCoordinate.columnNumber === 1 ||
        parsedCoordinate.columnNumber === totalColumns)
    );
  });

const assertNoOuterColumnSeatsAreHidden = ({
  totalRows,
  totalColumns,
  hiddenCoordinates = [],
}) => {
  const blockedCoordinates = findOuterColumnHiddenCoordinates({
    totalRows,
    totalColumns,
    hiddenCoordinates,
  });

  if (blockedCoordinates.length === 0) {
    return;
  }

  const blockedPreview = blockedCoordinates.slice(0, 4).join(', ');

  throw ApiError.badRequest(
    `Seats in the first and last columns cannot be hidden (${blockedPreview}${blockedCoordinates.length > 4 ? ', ...' : ''})`,
    'ROOM_EDGE_SEATS_MUST_EXIST',
    blockedCoordinates.map((coordinate) => ({
      path: 'hiddenCoordinates',
      message: `Seat ${coordinate} cannot be hidden because it is in the first or last column.`,
    }))
  );
};

const getSeatLayout = async (id) => {
  validateObjectId(id, 'Room');
  const room = await Room.findById(id).lean();
  if (!room) {
    throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }
  return room.seatLayout || [];
};

const updateSeatLayout = async (id, seatLayout) => {
  validateObjectId(id, 'Room');
  const room = await Room.findById(id).exec();
  if (!room) {
    throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }

  try {
    validateSeatLayout(seatLayout);
  } catch (error) {
    throw ApiError.badRequest(error.message, 'INVALID_LAYOUT');
  }

  room.seatLayout = seatLayout;
  room.markModified('seatLayout');
  await room.save();
  return room;
};

const buildRoomPayload = (payload) => {
  return {
    cinemaId: payload.cinemaId,
    name: payload.name.trim(),
    roomType: payload.roomType || 'standard',
    // totalRows/Columns will be updated by model middleware on save
  };
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

const createRoom = async (payload) => {
  await ensureCinemaExists(payload.cinemaId);

  // Initialize with empty layout if not provided
  const roomPayload = buildRoomPayload(payload);
  
  // Default layout if creating from Rooms page (initial)
  if (payload.totalRows && payload.totalColumns) {
    roomPayload.seatLayout = createSeatLayout({
      totalRows: payload.totalRows,
      totalColumns: payload.totalColumns,
    });
  }

  const room = await Room.create(roomPayload);
  return room.toObject();
};

const getRoomById = async (id) => {
  validateObjectId(id, 'Room');

  const room = await Room.findById(id).lean();

  if (!room) {
    throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }

  return room;
};

const updateRoom = async (id, payload) => {
  validateObjectId(id, 'Room');
  if (payload.cinemaId) await ensureCinemaExists(payload.cinemaId);

  const room = await Room.findById(id).exec();

  if (!room) {
    throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }

  if (payload.name) room.name = payload.name;
  if (payload.cinemaId) room.cinemaId = payload.cinemaId;
  if (payload.roomType) room.roomType = payload.roomType;

  await room.save();
  return room;
};

const deleteRoom = async (id) => {
  validateObjectId(id, 'Room');

  const room = await Room.findById(id).select('_id').lean().exec();

  if (!room) {
    throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }

  const activeShowtimeCount = await Showtime.countDocuments({ roomId: id });

  if (activeShowtimeCount > 0) {
    throw ApiError.conflict(
      'Cannot delete a room that still has showtimes',
      'ROOM_HAS_SHOWTIMES'
    );
  }

  await Room.deleteOne({ _id: id }).exec();
};

module.exports = {
  createRoom,
  deleteRoom,
  listRooms,
  getRoomById,
  updateRoom,
  getSeatLayout,
  updateSeatLayout,
};
