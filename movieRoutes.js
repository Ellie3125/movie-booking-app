const express = require("express");
const router = express.Router();

const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieStatus,
} = require("../controllers/movieController");

const { authenticate, requireAdmin } = require("../middlewares/auth");

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

/**
 * @route  GET /api/movies
 * @desc   Lấy danh sách phim (có filter, search, phân trang)
 * @access Public
 *
 * Query params:
 *   - status        : "now_showing" | "coming_soon" | "ended"
 *   - genre         : string hoặc array string, VD: genre=Action&genre=Sci-Fi
 *   - search        : tìm theo title hoặc description
 *   - page          : số trang (default: 1)
 *   - limit         : số bản ghi mỗi trang (default: 10, max: 100)
 *   - sortBy        : "releaseDate" | "title" | "duration" | "createdAt" (default: "releaseDate")
 *   - order         : "asc" | "desc" (default: "desc")
 */
router.get("/", getMovies);

/**
 * @route  GET /api/movies/:id
 * @desc   Lấy chi tiết một phim
 * @access Public
 */
router.get("/:id", getMovieById);

// ─────────────────────────────────────────────
// ADMIN ROUTES (yêu cầu đăng nhập + role admin)
// ─────────────────────────────────────────────

/**
 * @route  POST /api/movies
 * @desc   Tạo phim mới
 * @access Admin
 *
 * Body:
 *   - title        : string (required)
 *   - description  : string
 *   - duration     : number (phút, required)
 *   - genre        : string[]
 *   - poster       : string (URL)
 *   - releaseDate  : ISO date string (required)
 *   - status       : "now_showing" | "coming_soon" | "ended"
 */
router.post("/", authenticate, requireAdmin, createMovie);

/**
 * @route  PUT /api/movies/:id
 * @desc   Cập nhật toàn bộ thông tin phim
 * @access Admin
 */
router.put("/:id", authenticate, requireAdmin, updateMovie);

/**
 * @route  PATCH /api/movies/:id/status
 * @desc   Cập nhật trạng thái phim nhanh
 * @access Admin
 *
 * Body:
 *   - status: "now_showing" | "coming_soon" | "ended"
 */
router.patch("/:id/status", authenticate, requireAdmin, updateMovieStatus);

/**
 * @route  DELETE /api/movies/:id
 * @desc   Xóa phim
 * @access Admin
 */
router.delete("/:id", authenticate, requireAdmin, deleteMovie);

module.exports = router;
