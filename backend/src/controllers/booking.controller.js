const asyncHandler = require('../utils/asyncHandler');
const sendApiResponse = require('../utils/apiResponse');
const bookingService = require('../services/booking.service');

const createBooking = asyncHandler(async (req, res) => {
  const data = await bookingService.createBooking({
    userId: req.user.id,
    showtimeId: req.body.showtimeId,
    seatCoordinates: req.body.seatCoordinates,
  });

  return sendApiResponse(res, {
    statusCode: 201,
    message: 'Booking created and seats held successfully',
    data,
  });
});

const listMyBookings = asyncHandler(async (req, res) => {
  const data = await bookingService.listMyBookings({
    userId: req.user.id,
    status: req.query.status,
    paymentStatus: req.query.paymentStatus,
  });

  return sendApiResponse(res, {
    message: 'Bookings fetched successfully',
    data,
  });
});

const getMyBookingById = asyncHandler(async (req, res) => {
  const data = await bookingService.getMyBookingById({
    bookingId: req.params.bookingId,
    userId: req.user.id,
  });

  return sendApiResponse(res, {
    message: 'Booking fetched successfully',
    data,
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const data = await bookingService.cancelBooking({
    bookingId: req.params.bookingId,
    userId: req.user.id,
  });

  return sendApiResponse(res, {
    message: 'Booking cancelled successfully',
    data,
  });
});

const listBookingsAdmin = asyncHandler(async (req, res) => {
  const data = await bookingService.listBookingsAdmin({
    status: req.query.status,
    paymentStatus: req.query.paymentStatus,
    bookingCode: req.query.bookingCode,
    userId: req.query.userId,
  });

  return sendApiResponse(res, {
    message: 'Bookings fetched successfully',
    data,
  });
});

const getBookingByIdAdmin = asyncHandler(async (req, res) => {
  const data = await bookingService.getBookingByIdAdmin(req.params.bookingId);
  return sendApiResponse(res, {
    message: 'Booking fetched successfully',
    data,
  });
});

const cancelBookingAdmin = asyncHandler(async (req, res) => {
  const data = await bookingService.cancelBookingAdmin(req.params.bookingId);
  return sendApiResponse(res, {
    message: 'Booking cancelled successfully by admin',
    data,
  });
});

module.exports = {
  createBooking,
  listMyBookings,
  getMyBookingById,
  cancelBooking,
  listBookingsAdmin,
  getBookingByIdAdmin,
  cancelBookingAdmin,
};
