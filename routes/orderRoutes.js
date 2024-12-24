const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderDetails,
  payOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder, // Route để xóa đơn hàng
} = require('../controllers/orderController');

// Tạo đơn hàng
router.post('/create', createOrder);

// Lấy danh sách đơn hàng (Admin)
router.get('/', getAllOrders);

// Lấy chi tiết đơn hàng
router.get('/:orderId', getOrderDetails);

// Cập nhật trạng thái đơn hàng (Admin)
router.put('/:id/status', updateOrderStatus);

// Xóa đơn hàng
router.delete('/:id', deleteOrder);

// Thanh toán đơn hàng
router.post('/:orderId/pay', payOrder);

module.exports = router;
