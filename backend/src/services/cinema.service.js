const mongoose = require('mongoose');
const Cinema = require('../models/Cinema');
const ApiError = require('../utils/apiError');

const validateObjectId = (id, resourceName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(
      `${resourceName} id is invalid`,
      'INVALID_OBJECT_ID'
    );
  }
};

const validateEnumValue = (value, allowedValues, label, errorCode) => {
  if (value && !allowedValues.includes(value)) {
    throw ApiError.badRequest(
      `${label} must be one of: ${allowedValues.join(', ')}`,
      errorCode
    );
  }
};

const listCinemas = async ({ city, brand }) => {
  validateEnumValue(
    city,
    Cinema.schema.path('city').enumValues,
    'Cinema city',
    'INVALID_CINEMA_CITY'
  );
  validateEnumValue(
    brand,
    Cinema.schema.path('brand').enumValues,
    'Cinema brand',
    'INVALID_CINEMA_BRAND'
  );

  const filter = {};

  if (city) {
    filter.city = city;
  }

  if (brand) {
    filter.brand = brand;
  }

  const [items, total] = await Promise.all([
    Cinema.find(filter).sort({ city: 1, brand: 1, name: 1 }).lean(),
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

module.exports = {
  listCinemas,
  getCinemaById,
};
