const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getNotifications,
  getRecentOrders,
  getOrderAnalysis,
  getRevenueStats,
  getOrdersByDate
} = require('../controllers/dashboardController');

// Route tổng quan
router.get('/overview-stats', getOverviewStats);
// Route phân tích đơn hàng
router.get('/order-analysis', getOrderAnalysis);
// Route thông báo
router.get('/notifications', getNotifications);

// Route đơn hàng gần đây
router.get('/recent-orders', getRecentOrders);
// Route: Đơn hàng gần đây
// Route: Lấy đơn hàng theo thời gian
router.get('/orders-by-date', getOrdersByDate);// Route: Thống kê doanh thu
router.get('/revenue-stats', getRevenueStats);
module.exports = router;
