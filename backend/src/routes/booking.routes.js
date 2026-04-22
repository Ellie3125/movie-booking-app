const express = require("express");
const router = express.Router();

const {
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  getAllBookings,
} = require("../controllers/bookingController");

const { authenticate, requireAdmin } = require("../middlewares/auth");

/**
 * @route  GET /api/bookings/my
 * @desc   Lịch sử đặt vé của user hiện tại
 * @access Private
 * Query: page, limit
 */
router.get("/my", authenticate, getMyBookings);

/**
 * @route  GET /api/bookings
 * @desc   Toàn bộ booking (admin)
 * @access Admin
 * Query: userId, showtimeId, status, page, limit
 */
router.get("/", authenticate, requireAdmin, getAllBookings);

/**
 * @route  GET /api/bookings/:id
 * @desc   Chi tiết 1 booking (user chỉ xem được của mình)
 * @access Private
 */
router.get("/:id", authenticate, getBookingById);

/**
 * @route  POST /api/bookings
 * @desc   Tạo booking từ ghế đang giữ
 * @access Private
 * Body: { showtimeId, seatCodes, paymentMethod }
 */
router.post("/", authenticate, createBooking);

/**
 * @route  PATCH /api/bookings/:id/cancel
 * @desc   Hủy vé (user: chỉ hủy pending; admin: hủy cả paid)
 * @access Private
 */
router.patch("/:id/cancel", authenticate, cancelBooking);

module.exports = router;