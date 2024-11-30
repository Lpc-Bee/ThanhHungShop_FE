const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Route đăng ký
router.post('/dang-ky', register);

// Route đăng nhập
router.post('/dang-nhap', login);

module.exports = router;
