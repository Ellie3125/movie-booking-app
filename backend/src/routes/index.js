const express = require('express');
const authRoutes = require('./auth.routes');
const bookingRoutes = require('./booking.routes');
const movieRoutes = require('./movie.routes');
const cinemaRoutes = require('./cinema.routes');
const roomRoutes = require('./room.routes');
const showtimeRoutes = require('./showtime.routes');
const paymentRoutes = require('./payment.routes');
const ticketRoutes = require('./ticket.routes');
const mockGatewayRoutes = require('./mockGateway.routes');

const router = express.Router();

router.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Movie Booking API v1 is running',
    data: null
  });
});

router.use('/api/v1/movies', movieRoutes);
router.use('/api/v1/cinemas', cinemaRoutes);
router.use('/api/v1/rooms', roomRoutes);
router.use('/api/v1/showtimes', showtimeRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/bookings', bookingRoutes);
router.use('/api/v1/payments', paymentRoutes);
router.use('/api/v1/tickets', ticketRoutes);
router.use('/mock-gateway', mockGatewayRoutes);

module.exports = router;
