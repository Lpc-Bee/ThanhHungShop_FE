const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { authMiddleware, adminOnly } = require('../controllers/authMiddleware');

// Lấy danh sách người dùng (chỉ admin)
router.get('/', authMiddleware, adminOnly, getUsers);

// Cập nhật vai trò người dùng (admin)
router.put('/:id/role', authMiddleware, adminOnly, updateUserRole);

// Xóa người dùng (admin)
router.delete('/:id', authMiddleware, adminOnly, deleteUser);

module.exports = router;
