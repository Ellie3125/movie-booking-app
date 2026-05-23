const mongoose = require('mongoose');
const Cinema = require('../models/Cinema');
const ApiError = require('../utils/apiError');
const { VIETNAM_PROVINCES } = require('../constants/cinema.constants');

/**
 * Tính khoảng cách giữa 2 điểm bằng công thức Haversine.
 * @returns {number} Khoảng cách tính bằng km
 */
const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const validateObjectId = (id, resourceName) => {
  if (id && !mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(
      `${resourceName} id is invalid`,
      'INVALID_OBJECT_ID'
    );
  }
};

const listCinemas = async ({ city, brand }) => {
  const filter = {};

  if (city) {
    if (Array.isArray(city)) {
      filter.province = { $in: city };
    } else {
      filter.province = city;
    }
  }

  if (brand) {
    if (Array.isArray(brand)) {
      filter.brand = { $in: brand };
    } else {
      filter.brand = brand;
    }
  }

  const [items, total] = await Promise.all([
    Cinema.find(filter)
      .sort({ city: 1, name: 1 })
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

/**
 * Admin: cập nhật toạ độ cho cinema.
 * Lưu dạng GeoJSON Point: coordinates = [lng, lat].
 */
const updateCinemaLocation = async (id, { lat, lng }) => {
  validateObjectId(id, 'Cinema');

  const cinema = await Cinema.findById(id).exec();
  if (!cinema) {
    throw ApiError.notFound('Cinema not found', 'CINEMA_NOT_FOUND');
  }

  cinema.location = {
    type: 'Point',
    coordinates: [lng, lat], // GeoJSON: lng trước, lat sau
  };

  await cinema.save();
  return cinema;
};

/**
 * User: tìm các rạp gần nhất theo vị trí.
 * Sử dụng MongoDB $near với 2dsphere index.
 */
const getNearbyCinemas = async ({ lat, lng, limit = 5, maxDistance = 10000 }) => {
  const cinemas = await Cinema.find({
    isActive: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistance, // mét
      },
    },
  })
    .limit(limit)
    .select('name brand address phone imageUrl location')
    .lean();

  return cinemas.map((cinema) => {
    const [cinemaLng, cinemaLat] = cinema.location.coordinates;
    const distanceKm = Math.round(calcDistance(lat, lng, cinemaLat, cinemaLng) * 10) / 10;
    return { ...cinema, distanceKm };
  });
};

module.exports = {
  listCinemas,
  getCinemaById,
  listProvinces,
  createCinema,
  updateCinema,
  updateCinemaLocation,
  deleteCinema,
  getNearbyCinemas,
};
