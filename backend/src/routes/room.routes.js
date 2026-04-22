const router = require('express').Router();
const { verifyToken, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/roomsController');

// GET /api/v1/rooms?cinemaId=...
router.get('/',              ctrl.list);

// GET /api/v1/rooms/:id  — chi tiết phòng + sơ đồ ghế
router.get('/:id',           ctrl.getOne);

// GET /api/v1/rooms/:id/showtimes?date=2026-04-15
router.get('/:id/showtimes', ctrl.getShowtimes);

// POST /api/v1/rooms  (admin/staff)
router.post('/',             verifyToken, requireRole('admin', 'staff'), ctrl.create);

// PUT /api/v1/rooms/:id  (admin/staff)
router.put('/:id',           verifyToken, requireRole('admin', 'staff'), ctrl.update);

// DELETE /api/v1/rooms/:id  (admin)
router.delete('/:id',        verifyToken, requireRole('admin'), ctrl.remove);

module.exports = router;