const express = require('express');
const router = express.Router();
const { register, login, verifyToken } = require('../controllers/authController');
const { authMiddleware, adminOnly } = require('../controllers/authMiddleware');


router.post('/dang-ky', register);
router.get('/verify-token', verifyToken);
router.post('/dang-nhap', login);

// API dành riêng cho admin để lấy danh sách tất cả người dùng
router.get('/get-all-users', authMiddleware, adminOnly, async (req, res) => {
    try {
        const users = await new sql.Request().query('SELECT id, email, firstName, lastName, role FROM Users');
        res.json({ message: 'Lấy danh sách người dùng thành công!', users });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
});

module.exports = router;
