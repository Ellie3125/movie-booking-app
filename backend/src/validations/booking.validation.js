const Booking = require('../models/Booking');
const { Joi, strictObject, objectId } = require('./common.validation');

const bookingStatusValues = Booking.schema.path('status').enumValues;
const paymentStatusValues = Booking.schema.path('paymentStatus').enumValues;

const singleSeatCodePattern = /^[A-Z]+[1-9]\d*$/;
const coupleSeatRangePattern = /^([A-Z]+)([1-9]\d*)-\1([1-9]\d*)$/;

const validateSeatCodeFormat = (value, helpers) => {
  if (singleSeatCodePattern.test(value)) {
    return value;
  }

  const coupleRangeMatch = value.match(coupleSeatRangePattern);
  if (coupleRangeMatch) {
    const firstSeatNumber = Number(coupleRangeMatch[2]);
    const secondSeatNumber = Number(coupleRangeMatch[3]);

    if (secondSeatNumber === firstSeatNumber + 1) {
      return value;
    }
  }

  return helpers.error('seatCode.invalidFormat');
};

const seatCodeSchema = Joi.string()
  .trim()
  .uppercase()
  .custom(validateSeatCodeFormat, 'seat code format validation')
  .required()
  .label('seatCode')
  .messages({
    'seatCode.invalidFormat':
      'seatCode must use a valid seat format such as A1',
  });

const bookingIdParamSchema = strictObject({
  bookingId: objectId.required().label('bookingId'),
});

const createBookingSchema = {
  body: strictObject({
    showtimeId: objectId.required().label('showtimeId'),
    seatCodes: Joi.array()
      .items(seatCodeSchema)
      .min(1)
      .unique()
      .required()
      .label('seatCodes')
      .messages({
        'array.base': 'seatCodes must be an array',
        'array.min': 'seatCodes must contain at least 1 seat',
        'array.unique': 'seatCodes must not contain duplicate values',
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
