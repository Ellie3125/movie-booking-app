const { Joi, objectId, strictObject } = require('./common.validation');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const showtimeIdParamSchema = strictObject({
  id: objectId.required().label('id'),
});

const createShowtimeScheduleBodySchema = strictObject({
  movieId: objectId.required().label('movieId'),
  cinemaId: objectId.required().label('cinemaId'),
  roomId: objectId.required().label('roomId'),
  startDate: Joi.string()
    .trim()
    .pattern(DATE_PATTERN)
    .required()
    .label('startDate'),
  endDate: Joi.string()
    .trim()
    .pattern(DATE_PATTERN)
    .required()
    .label('endDate'),
  showsPerDay: Joi.number().integer().min(1).max(12).required().label('showsPerDay'),
});

const bulkCreateShowtimeBodySchema = strictObject({
  movieId: objectId.required().label('movieId'),
  cinemaIds: Joi.array().items(objectId).required().min(1).label('cinemaIds'),
  roomIds: Joi.array().items(objectId).required().min(1).label('roomIds'),
  startDate: Joi.string().trim().pattern(DATE_PATTERN).required().label('startDate'),
  endDate: Joi.string().trim().pattern(DATE_PATTERN).required().label('endDate'),
  mode: Joi.string().valid('MANUAL', 'AUTO').default('MANUAL').label('mode'),
  startTimes: Joi.when('mode', {
    is: 'MANUAL',
    then: Joi.array()
      .items(Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/))
      .required()
      .min(1),
    otherwise: Joi.array().items(Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)),
  }).label('startTimes'),
  showsPerDay: Joi.number().integer().min(1).max(20).label('showsPerDay'),
  openingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).label('openingTime'),
  closingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).label('closingTime'),
  cleaningMinutes: Joi.number().integer().min(0).max(120).label('cleaningMinutes'),
  basePrice: Joi.number().integer().min(0).required().label('basePrice'),
  dryRun: Joi.boolean().default(false).label('dryRun'),
});

const showtimeMutationBodySchema = strictObject({
  movieId: objectId.required().label('movieId'),
  cinemaId: objectId.required().label('cinemaId'),
  roomId: objectId.required().label('roomId'),
  startTime: Joi.date().iso().required().label('startTime'),
  price: Joi.number().min(0).required().label('price'),
  status: Joi.string().valid('active', 'locked').label('status'),
});

module.exports = {
  createShowtimeScheduleSchema: {
    body: createShowtimeScheduleBodySchema,
  },
  bulkCreateShowtimeSchema: {
    body: bulkCreateShowtimeBodySchema,
  },
  showtimeIdParamSchema: {
    params: showtimeIdParamSchema,
  },
  createShowtimeSchema: {
    body: showtimeMutationBodySchema,
  },
  updateShowtimeSchema: {
    params: showtimeIdParamSchema,
    body: showtimeMutationBodySchema,
  },
};
