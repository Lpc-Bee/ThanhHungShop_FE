const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Lấy token từ header
    console.log('Token từ Authorization Header:', token); // Log token
  
    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập!' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      console.log('Token giải mã:', decoded); // Log thông tin giải mã
      req.user = decoded; 
      next();
    } catch (err) {
      console.error('❌ Lỗi xác thực token:', err.message);
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
  };
  
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: 'Bạn không có quyền truy cập, chỉ dành cho admin!' });
    }
};

module.exports = { authMiddleware, adminOnly };
