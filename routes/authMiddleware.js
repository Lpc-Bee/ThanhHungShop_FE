const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decoded; // ✅ Gán thông tin user từ token vào req.user
        next();
    } catch (err) {
        console.error('❌ Lỗi xác thực token:', err.message);
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};


// Middleware chỉ cho phép admin truy cập
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Bạn không phải là admin.' });
    }
    next();
};

module.exports = { authMiddleware, adminOnly };
