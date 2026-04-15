const Booking = require('../models/Booking');
const { Joi, strictObject, objectId } = require('./common.validation');

const bookingStatusValues = Booking.schema.path('status').enumValues;
const paymentStatusValues = Booking.schema.path('paymentStatus').enumValues;

const seatCoordinateSchema = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z]+[1-9]\d*$/)
  .required()
  .label('seatCoordinate')
  .messages({
    'string.pattern.base':
      'seatCoordinate must use a valid seat coordinate format such as A1',
  });

const bookingIdParamSchema = strictObject({
  bookingId: objectId.required().label('bookingId'),
});

const createBookingSchema = {
  body: strictObject({
    showtimeId: objectId.required().label('showtimeId'),
    seatCoordinates: Joi.array()
      .items(seatCoordinateSchema)
      .min(1)
      .unique()
      .required()
      .label('seatCoordinates')
      .messages({
        'array.base': 'seatCoordinates must be an array',
        'array.min': 'seatCoordinates must contain at least 1 seat',
        'array.unique': 'seatCoordinates must not contain duplicate values',
      }),
  }),
};

const listBookingsQuerySchema = strictObject({
  status: Joi.string()
    .valid(...bookingStatusValues)
    .optional()
    .label('status'),
  paymentStatus: Joi.string()
    .valid(...paymentStatusValues)
    .optional()
    .label('paymentStatus'),
});

module.exports = {
  bookingIdParamSchema,
  createBookingSchema,
  listBookingsQuerySchema,
};
