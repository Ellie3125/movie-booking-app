const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const cinemaBrandService = require('../services/cinemaBrand.service');

const listBrands = asyncHandler(async (req, res) => {
  const data = await cinemaBrandService.listBrands(req.query);
  return sendApiResponse(res, { message: 'Brands fetched successfully', data });
});

const getBrandById = asyncHandler(async (req, res) => {
  const data = await cinemaBrandService.getBrandById(req.params.id);
  return sendApiResponse(res, { message: 'Brand fetched successfully', data });
});

const createBrand = asyncHandler(async (req, res) => {
  const data = await cinemaBrandService.createBrand(req.body);
  return sendApiResponse(res, { statusCode: 201, message: 'Brand created successfully', data });
});

const updateBrand = asyncHandler(async (req, res) => {
  const data = await cinemaBrandService.updateBrand(req.params.id, req.body);
  return sendApiResponse(res, { message: 'Brand updated successfully', data });
});

const deleteBrand = asyncHandler(async (req, res) => {
  await cinemaBrandService.deleteBrand(req.params.id);
  return sendApiResponse(res, { message: 'Brand deleted successfully', data: null });
});

module.exports = {
  listBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
