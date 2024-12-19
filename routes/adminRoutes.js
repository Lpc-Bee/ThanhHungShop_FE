const express = require('express');
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { getProducts, deleteProduct,updateProduct,addProduct } = require('../controllers/productController');

const { getOverviewStats } = require('../controllers/dashboardController');
const router = express.Router();

router.get('/users', getUsers); // Kiểm tra hàm `getUsers`
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/products', getProducts); // Kiểm tra hàm `getProducts`
router.put('/products/:id', updateProduct); // Đảm bảo route này có
router.delete('/products/:id', deleteProduct);
router.post('/products', addProduct);


router.get('/overview-stats', getOverviewStats); // Kiểm tra hàm `getOverviewStats`

module.exports = router;
