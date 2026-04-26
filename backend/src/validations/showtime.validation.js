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

module.exports = {
  createShowtimeScheduleSchema: {
    body: createShowtimeScheduleBodySchema,
  },
  showtimeIdParamSchema: {
    params: showtimeIdParamSchema,
  },
};
