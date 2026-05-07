const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET /api/v1/dashboard/stats — admin only
router.get('/stats', protect, requireRole('admin'), getDashboardStats);

module.exports = router;
