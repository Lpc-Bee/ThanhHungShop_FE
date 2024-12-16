const express = require('express');
const router = express.Router();
const { getOverviewStats } = require('../controllers/dashboardController');
const { authMiddleware, adminOnly } = require('../controllers/authMiddleware');

// Lấy thống kê tổng quan (chỉ admin)
router.get('/', authMiddleware, adminOnly, getOverviewStats);

module.exports = router;
