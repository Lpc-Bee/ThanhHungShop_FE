const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart,updateQuantity } = require('../controllers/cartController');
const { authMiddleware } = require('../controllers/authMiddleware');

router.post('/addtocart', authMiddleware, addToCart); // ✅ Thêm sản phẩm vào giỏ
router.get('/getcart', authMiddleware, getCart); // ✅ Lấy giỏ hàng của người dùng
router.delete('/:cartItemId', authMiddleware, removeFromCart); // ✅ Xóa sản phẩm khỏi giỏ
router.put('/update', authMiddleware, updateQuantity); // ✅ Cập nhật số lượng sản phẩm trong giỏ


module.exports = router;
