const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Lấy token từ header

    if (!token) {
        return res.status(401).json({ message: 'Không có token, không thể xác thực!' });
    }

    try {
        // Kiểm tra và giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decoded;  // Lưu thông tin người dùng đã giải mã vào request
        next();  // Chuyển sang middleware tiếp theo
    } catch (err) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

module.exports = authMiddleware;
