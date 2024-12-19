const express = require('express');
const {getProducts} = require('../controllers/productController');
const router = express.Router();

// Nếu muốn tất cả người dùng đều có thể xem sản phẩm
router.get('/shop', getProducts);

module.exports = router;
