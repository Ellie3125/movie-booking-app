const express = require("express");
const router = express.Router();

const {
  getCinemas,
  getCinemaById,
  getRoomsByCinema,
  createCinema,
  updateCinema,
  deleteCinema,
} = require("../controllers/cinemaController");

const {
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

const { authenticate, requireAdmin } = require("../middlewares/auth");

// ── CINEMA ───────────────────────────────────

/**
 * @route  GET /api/cinemas
 * @desc   Danh sách rạp (filter: city, brand)
 * @access Public
 */
router.get("/", getCinemas);

/**
 * @route  GET /api/cinemas/:id
 * @access Public
 */
router.get("/:id", getCinemaById);

/**
 * @route  GET /api/cinemas/:id/rooms
 * @desc   Danh sách phòng chiếu của rạp (không kèm seatLayout)
 * @access Public
 */
router.get("/:id/rooms", getRoomsByCinema);

/**
 * @route  POST /api/cinemas
 * @access Admin
 * Body: { brand, name, city, address }
 */
router.post("/", authenticate, requireAdmin, createCinema);

/**
 * @route  PUT /api/cinemas/:id
 * @access Admin
 */
router.put("/:id", authenticate, requireAdmin, updateCinema);

/**
 * @route  DELETE /api/cinemas/:id
 * @desc   Xóa rạp + toàn bộ room thuộc rạp
 * @access Admin
 */
router.delete("/:id", authenticate, requireAdmin, deleteCinema);

// ── ROOM ─────────────────────────────────────

/**
 * @route  GET /api/cinemas/rooms/:roomId
 * @desc   Chi tiết phòng chiếu kèm đầy đủ seatLayout
 * @access Public
 */
router.get("/rooms/:roomId", getRoomById);

/**
 * @route  POST /api/cinemas/rooms
 * @access Admin
 * Body: { cinemaId, name, screenLabel, totalColumns, seatLayout }
 */
router.post("/rooms", authenticate, requireAdmin, createRoom);

/**
 * @route  PUT /api/cinemas/rooms/:roomId
 * @access Admin
 */
router.put("/rooms/:roomId", authenticate, requireAdmin, updateRoom);

/**
 * @route  DELETE /api/cinemas/rooms/:roomId
 * @access Admin
 */
router.delete("/rooms/:roomId", authenticate, requireAdmin, deleteRoom);

module.exports = router;