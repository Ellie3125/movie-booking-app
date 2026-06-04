const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const cinemaService = require('../services/cinema.service');

const listCinemas = asyncHandler(async (req, res) => {
  const data = await cinemaService.listCinemas({
    city: req.query.city || req.query['city[]'],
    brand: req.query.brand || req.query['brand[]'],
  });

  return sendApiResponse(res, {
    message: 'Cinemas fetched successfully',
    data,
  });
});

const getCinemaById = asyncHandler(async (req, res) => {
  const data = await cinemaService.getCinemaById(req.params.id);

  return sendApiResponse(res, {
    message: 'Cinema fetched successfully',
    data,
  });
});

const getNearbyCinemas = asyncHandler(async (req, res) => {
  const data = await cinemaService.getNearbyCinemas({
    lat: req.query.lat,
    lng: req.query.lng,
    limit: req.query.limit,
    maxDistance: req.query.maxDistance,
  });

  return sendApiResponse(res, {
    message: 'Nearby cinemas fetched successfully',
    data,
  });
});

const updateCinemaLocation = asyncHandler(async (req, res) => {
  const data = await cinemaService.updateCinemaLocation(req.params.id, {
    lat: req.body.lat,
    lng: req.body.lng,
  });

  return sendApiResponse(res, {
    message: 'Cinema location updated successfully',
    data,
  });
});

const listBrands = asyncHandler(async (req, res) => {
  const data = await cinemaService.listBrands();
  return sendApiResponse(res, {
    message: 'Cinema brands fetched successfully',
    data,
  });
});

const listCities = asyncHandler(async (req, res) => {
  const data = await cinemaService.listCities();
  return sendApiResponse(res, {
    message: 'Cinema cities fetched successfully',
    data,
  });
});

const createCinema = asyncHandler(async (req, res) => {
  const data = await cinemaService.createCinema(req.body);
  return sendApiResponse(res, {
    statusCode: 201,
    message: 'Cinema created successfully',
    data,
  });
});

const updateCinema = asyncHandler(async (req, res) => {
  const data = await cinemaService.updateCinema(req.params.id, req.body);
  return sendApiResponse(res, {
    message: 'Cinema updated successfully',
    data,
  });
});

const deleteCinema = asyncHandler(async (req, res) => {
  await cinemaService.deleteCinema(req.params.id);
  return sendApiResponse(res, {
    message: 'Cinema deleted successfully',
    data: null,
  });
});

module.exports = {
  listCinemas,
  getCinemaById,
  getNearbyCinemas,
  updateCinemaLocation,
  listBrands,
  listCities,
  createCinema,
  updateCinema,
  deleteCinema,
};
