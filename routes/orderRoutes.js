const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');
const { authMiddleware } = require('../controllers/authMiddleware');

router.post('/create', authMiddleware, createOrder);

module.exports = router;
