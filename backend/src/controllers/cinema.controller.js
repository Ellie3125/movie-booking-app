const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const cinemaService = require('../services/cinema.service');

const listCinemas = asyncHandler(async (req, res) => {
  const data = await cinemaService.listCinemas({
    city: req.query.city,
    brand: req.query.brand,
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

module.exports = {
  listCinemas,
  getCinemaById,
};
