const CinemaBrand = require('../models/CinemaBrand');
const ApiError = require('../utils/apiError');
const mongoose = require('mongoose');

const validateObjectId = (id, resourceName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(`${resourceName} id is invalid`, 'INVALID_OBJECT_ID');
  }
};

const listBrands = async (params = {}) => {
  const filter = {};
  if (params.status) filter.status = params.status;
  
  const [items, total] = await Promise.all([
    CinemaBrand.find(filter).sort({ name: 1 }).lean(),
    CinemaBrand.countDocuments(filter),
  ]);

  return { items, total };
};

const getBrandById = async (id) => {
  validateObjectId(id, 'CinemaBrand');
  const brand = await CinemaBrand.findById(id).lean();
  if (!brand) {
    throw ApiError.notFound('CinemaBrand not found', 'BRAND_NOT_FOUND');
  }
  return brand;
};

const createBrand = async (payload) => {
  const brand = await CinemaBrand.create(payload);
  return brand.toObject();
};

const updateBrand = async (id, payload) => {
  validateObjectId(id, 'CinemaBrand');
  const brand = await CinemaBrand.findById(id).exec();
  if (!brand) {
    throw ApiError.notFound('CinemaBrand not found', 'BRAND_NOT_FOUND');
  }
  Object.assign(brand, payload);
  await brand.save();
  return brand.toObject();
};

const deleteBrand = async (id) => {
  validateObjectId(id, 'CinemaBrand');
  const Cinema = require('../models/Cinema');
  const hasCinemas = await Cinema.exists({ brand: id });
  if (hasCinemas) {
    throw ApiError.conflict('Cannot delete brand that has cinemas', 'BRAND_HAS_CINEMAS');
  }
  await CinemaBrand.deleteOne({ _id: id }).exec();
};

module.exports = {
  listBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
