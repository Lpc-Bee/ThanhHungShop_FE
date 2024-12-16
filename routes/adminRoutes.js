const express = require('express');
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { getProducts, deleteProduct } = require('../controllers/productController');
const { getOrders, updateOrderStatus } = require('../controllers/orderController');
const { getOverviewStats } = require('../controllers/dashboardController');
const router = express.Router();


router.get('/users', authMiddleware, getUsers);
router.put('/users/:id/role', authMiddleware, updateUserRole);
router.delete('/users/:id', authMiddleware, deleteUser);

router.get('/products', authMiddleware, getProducts);

router.delete('/products/:id', authMiddleware, deleteProduct);

router.get('/orders', authMiddleware, getOrders);
router.put('/orders/:id/status', authMiddleware, updateOrderStatus);


router.get('/overview-stats', authMiddleware, getOverviewStats);

module.exports = router;
