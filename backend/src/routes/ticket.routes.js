const router = require('express').Router();
const { verifyToken, requireRole } = require('../middlewares/auth');
const ctrl = require('../controllers/ticketsController');

// GET /api/v1/tickets/my  — vé của user đang đăng nhập
router.get('/my',            verifyToken, ctrl.myTickets);

// GET /api/v1/tickets/:id  — chi tiết 1 vé
router.get('/:id',           verifyToken, ctrl.getOne);

// GET /api/v1/tickets/booking/:bookingId  — tất cả vé của 1 booking
router.get('/booking/:bookingId', verifyToken, ctrl.byBooking);

// POST /api/v1/tickets/:id/verify  — staff quét QR xác nhận vé
router.post('/:id/verify',   verifyToken, requireRole('admin', 'staff'), ctrl.verify);

// GET /api/v1/tickets  (admin/staff)
router.get('/',              verifyToken, requireRole('admin', 'staff'), ctrl.listAll);

module.exports = router;