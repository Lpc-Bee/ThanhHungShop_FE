const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getNotifications,
  getRecentOrders,
  getOrderAnalysis
} = require('../controllers/dashboardController');

// Route tổng quan
router.get('/overview-stats', getOverviewStats);
// Route phân tích đơn hàng
router.get('/order-analysis', getOrderAnalysis);
// Route thông báo
router.get('/notifications', getNotifications);

// Route đơn hàng gần đây
router.get('/recent-orders', getRecentOrders);

module.exports = router;
