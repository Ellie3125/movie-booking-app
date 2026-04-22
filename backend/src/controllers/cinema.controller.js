const { Cinema, Room } = require("../models");

// ─────────────────────────────────────────────
// [PUBLIC] GET /cinemas
// Query: city, brand
// ─────────────────────────────────────────────
const getCinemas = async (req, res) => {
  try {
    const { city, brand } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: city, $options: "i" };
    if (brand) filter.brand = { $regex: brand, $options: "i" };

    const cinemas = await Cinema.find(filter).sort({ brand: 1, name: 1 }).lean();
    res.json({ success: true, data: cinemas });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [PUBLIC] GET /cinemas/:id
// ─────────────────────────────────────────────
const getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id).lean();
    if (!cinema) return res.status(404).json({ success: false, message: "Không tìm thấy rạp" });
    res.json({ success: true, data: cinema });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [PUBLIC] GET /cinemas/:id/rooms
// ─────────────────────────────────────────────
const getRoomsByCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id).lean();
    if (!cinema) return res.status(404).json({ success: false, message: "Không tìm thấy rạp" });

    const rooms = await Room.find({ cinemaId: req.params.id })
      .select("-seatLayout") // không trả layout chi tiết trong list
      .lean();

    res.json({ success: true, data: rooms });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [ADMIN] POST /cinemas
// ─────────────────────────────────────────────
const createCinema = async (req, res) => {
  try {
    const { brand, name, city, address } = req.body;
    const cinema = await Cinema.create({ brand, name, city, address });
    res.status(201).json({ success: true, message: "Tạo rạp thành công", data: cinema });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [ADMIN] PUT /cinemas/:id
// ─────────────────────────────────────────────
const updateCinema = async (req, res) => {
  try {
    const { brand, name, city, address } = req.body;
    const cinema = await Cinema.findByIdAndUpdate(
      req.params.id,
      { $set: { brand, name, city, address } },
      { new: true, runValidators: true }
    );
    if (!cinema) return res.status(404).json({ success: false, message: "Không tìm thấy rạp" });
    res.json({ success: true, message: "Cập nhật rạp thành công", data: cinema });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

// ─────────────────────────────────────────────
// [ADMIN] DELETE /cinemas/:id
// ─────────────────────────────────────────────
const deleteCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) return res.status(404).json({ success: false, message: "Không tìm thấy rạp" });

    // Xóa toàn bộ room thuộc rạp này
    await Room.deleteMany({ cinemaId: req.params.id });

    res.json({ success: true, message: "Xóa rạp thành công" });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

module.exports = { getCinemas, getCinemaById, getRoomsByCinema, createCinema, updateCinema, deleteCinema };