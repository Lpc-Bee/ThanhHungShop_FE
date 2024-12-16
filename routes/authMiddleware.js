const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Lấy token từ header Authorization

    if (!token) {
        return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập lại!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
        req.user = decoded; // Lưu thông tin người dùng đã giải mã vào request
        next();
    } catch (error) {
        console.error('Lỗi khi giải mã token:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn, vui lòng đăng nhập lại!' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token không hợp lệ!' });
        } else {
            return res.status(500).json({ message: 'Lỗi máy chủ khi xác thực token!' });
        }
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
