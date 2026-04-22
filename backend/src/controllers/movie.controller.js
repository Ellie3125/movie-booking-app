const { Movie } = require("../models");

// ─────────────────────────────────────────────
// [PUBLIC] GET /movies
// Query: status, genre, search, page, limit, sortBy, order
// ─────────────────────────────────────────────
const getMovies = async (req, res) => {
  try {
    const {
      status,
      genre,
      search,
      page = 1,
      limit = 10,
      sortBy = "releaseDate",
      order = "desc",
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (genre) {
      filter.genre = { $in: Array.isArray(genre) ? genre : [genre] };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const allowedSortFields = ["releaseDate", "title", "duration", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "releaseDate";

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Movie.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: movies,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [PUBLIC] GET /movies/:id
// ─────────────────────────────────────────────
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).lean();

    if (!movie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim" });
    }

    res.json({ success: true, data: movie });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID phim không hợp lệ" });
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [ADMIN] POST /movies
// ─────────────────────────────────────────────
const createMovie = async (req, res) => {
  try {
    const { title, description, duration, genre, poster, releaseDate, status } = req.body;

    const movie = await Movie.create({
      title,
      description,
      duration,
      genre,
      poster,
      releaseDate,
      status,
    });

    res.status(201).json({ success: true, message: "Tạo phim thành công", data: movie });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [ADMIN] PUT /movies/:id
// ─────────────────────────────────────────────
const updateMovie = async (req, res) => {
  try {
    const allowedFields = ["title", "description", "duration", "genre", "poster", "releaseDate", "status"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim" });
    }

    res.json({ success: true, message: "Cập nhật phim thành công", data: movie });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID phim không hợp lệ" });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [ADMIN] DELETE /movies/:id
// ─────────────────────────────────────────────
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim" });
    }

    res.json({ success: true, message: "Xóa phim thành công" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID phim không hợp lệ" });
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [ADMIN] PATCH /movies/:id/status
// Body: { status: "now_showing" | "coming_soon" | "ended" }
// ─────────────────────────────────────────────
const updateMovieStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["now_showing", "coming_soon", "ended"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Các giá trị hợp lệ: ${validStatuses.join(", ")}`,
      });
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim" });
    }

    res.json({ success: true, message: "Cập nhật trạng thái phim thành công", data: movie });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "ID phim không hợp lệ" });
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieStatus,
};
