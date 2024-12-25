const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');


// Lấy danh sách người dùng (chỉ admin)
router.get('/', getUsers);

// Cập nhật vai trò người dùng (admin)
router.put('/:id/role', updateUserRole);

// Xóa người dùng (admin)
router.delete('/:id',  deleteUser);

module.exports = router;
