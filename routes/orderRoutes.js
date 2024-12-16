const express = require('express');
const router = express.Router();
const { createOrder, payOrder } = require('../controllers/orderController');

router.post('/', createOrder); // Tạo đơn hàng
router.post('/:orderId/pay', payOrder); // Thanh toán đơn hàng

module.exports = router;
