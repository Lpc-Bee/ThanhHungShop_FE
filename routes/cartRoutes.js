const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');

router.post('/', addToCart); // Thêm sản phẩm vào giỏ
router.get('/', getCart); // Lấy giỏ hàng của người dùng
router.delete('/:cartItemId', removeFromCart); // Xóa sản phẩm khỏi giỏ

module.exports = router;
