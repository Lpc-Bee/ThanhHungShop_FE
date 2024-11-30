const { sql } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Truy vấn người dùng từ SQL Server
        const result = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
        
        if (result.recordset.length === 0) {
            return res.status(400).json({ message: 'Sai thông tin đăng nhập' });
        }

        const user = result.recordset[0];
        
        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Sai thông tin đăng nhập' });
        }

        // Tạo JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Lỗi trong quá trình đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
