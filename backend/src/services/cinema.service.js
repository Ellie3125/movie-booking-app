const mongoose = require('mongoose');
const Cinema = require('../models/Cinema');
const ApiError = require('../utils/apiError');
const { VIETNAM_PROVINCES } = require('../constants/cinema.constants');

const validateObjectId = (id, resourceName) => {
  if (id && !mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(
      `${resourceName} id is invalid`,
      'INVALID_OBJECT_ID'
    );
  }
};

const listCinemas = async ({ province, brand }) => {
  const filter = {};

  if (province) {
    filter.province = province;
  }

  if (brand) {
    filter.brand = brand;
  }

  const [items, total] = await Promise.all([
    Cinema.find(filter)
      .sort({ province: 1, name: 1 })
      .lean(),
    Cinema.countDocuments(filter),
  ]);

  return { items, total };
};

const getCinemaById = async (id) => {
  validateObjectId(id, 'Cinema');

  const cinema = await Cinema.findById(id).lean();

  if (!cinema) {
    throw ApiError.notFound('Cinema not found', 'CINEMA_NOT_FOUND');
  }

  return cinema;
};

const createCinema = async (payload) => {
  const cinema = await Cinema.create(payload);
  return cinema;
};

const updateCinema = async (id, payload) => {
  validateObjectId(id, 'Cinema');
  const cinema = await Cinema.findById(id).exec();
  if (!cinema) {
    throw ApiError.notFound('Cinema not found', 'CINEMA_NOT_FOUND');
  }
  Object.assign(cinema, payload);
  await cinema.save();
  return cinema;
};

const deleteCinema = async (id) => {
  validateObjectId(id, 'Cinema');
  const cinema = await Cinema.findById(id).select('_id').lean().exec();
  if (!cinema) {
    throw ApiError.notFound('Cinema not found', 'CINEMA_NOT_FOUND');
  }
  
  const Room = mongoose.model('Room');
  const hasRooms = await Room.exists({ cinemaId: id });
  if (hasRooms) {
    throw ApiError.conflict('Cannot delete cinema that has rooms', 'CINEMA_HAS_ROOMS');
  }

  await Cinema.deleteOne({ _id: id }).exec();
};

const listProvinces = async () => {
  return VIETNAM_PROVINCES;
};

module.exports = {
  listCinemas,
  getCinemaById,
  listProvinces,
  createCinema,
  updateCinema,
  deleteCinema,
};
