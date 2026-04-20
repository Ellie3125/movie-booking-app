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

const ensureCinemaExists = async (cinemaId) => {
  validateObjectId(cinemaId, 'Cinema');

  const cinema = await Cinema.findById(cinemaId).select('_id').lean().exec();

  if (!cinema) {
    throw ApiError.notFound('Cinema not found', 'CINEMA_NOT_FOUND');
  }
};

const normalizeHiddenCoordinates = (hiddenCoordinates = []) =>
  [...new Set(hiddenCoordinates.map((coordinate) => coordinate.toUpperCase()))];

const buildRoomPayload = (payload, currentRoom = null) => {
  const hiddenCoordinates = normalizeHiddenCoordinates(payload.hiddenCoordinates);
  const seatTypeOverrides = currentRoom
    ? extractSeatTypeOverrides(currentRoom.seatLayout)
    : {};

  return {
    cinemaId: payload.cinemaId,
    name: payload.name.trim(),
    screenLabel: payload.screenLabel.trim(),
    totalRows: payload.totalRows,
    totalColumns: payload.totalColumns,
    seatLayout: createSeatLayout({
      totalRows: payload.totalRows,
      totalColumns: payload.totalColumns,
      hiddenCoordinates,
      seatTypeOverrides,
    }),
  };
};

const assertNoOccupiedSeatsAreRemoved = async (roomId, nextSeatLayout) => {
  const nextSeatCoordinateSet = new Set(
    flattenRoomSeats(nextSeatLayout).map((seat) =>
      String(seat.coordinate.coordinateLabel).toUpperCase()
    )
  );

  const showtimes = await Showtime.find({ roomId })
    .select('seatStates.seatCoordinate seatStates.status')
    .lean()
    .exec();

  const conflicts = [];

  showtimes.forEach((showtime) => {
    (showtime.seatStates || []).forEach((seatState) => {
      const coordinate = String(seatState.seatCoordinate).toUpperCase();

      if (
        !nextSeatCoordinateSet.has(coordinate) &&
        seatState.status &&
        seatState.status !== 'available'
      ) {
        conflicts.push({
          path: 'hiddenCoordinates',
          message: `Seat ${coordinate} is already ${seatState.status} in an existing showtime and cannot be removed.`,
        });
      }
    });
  });

  if (conflicts.length > 0) {
    throw ApiError.conflict(
      'Room layout cannot remove seats that are already held, reserved, or paid',
      'ROOM_LAYOUT_CONFLICT',
      conflicts.slice(0, 10)
    );
  }
};

const syncShowtimesForRoom = async (room) => {
  const showtimes = await Showtime.find({ roomId: room._id }).exec();

  if (showtimes.length === 0) {
    return;
  }

  await Promise.all(
    showtimes.map(async (showtime) => {
      showtime.cinemaId = room.cinemaId;
      showtime.seatStates = buildShowtimeSeatStatesFromRoomLayout(
        room.seatLayout,
        showtime.seatStates || []
      );
      await showtime.save();
    })
  );
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

  const room = await Room.create(buildRoomPayload(payload));

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
  await ensureCinemaExists(payload.cinemaId);

  const room = await Room.findById(id).exec();

  if (!room) {
    throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  }

  const nextRoomPayload = buildRoomPayload(payload, room);
  await assertNoOccupiedSeatsAreRemoved(room._id, nextRoomPayload.seatLayout);

  room.cinemaId = nextRoomPayload.cinemaId;
  room.name = nextRoomPayload.name;
  room.screenLabel = nextRoomPayload.screenLabel;
  room.totalRows = nextRoomPayload.totalRows;
  room.totalColumns = nextRoomPayload.totalColumns;
  room.seatLayout = nextRoomPayload.seatLayout;

  await room.save();
  await syncShowtimesForRoom(room);

  return Room.findById(room._id).lean().exec();
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
};
