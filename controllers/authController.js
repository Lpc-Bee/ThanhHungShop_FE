const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');

// Hàm xử lý đăng ký
exports.register = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
    }

    // Kiểm tra định dạng email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Email không hợp lệ!' });
    }

    try {
        console.log('Dữ liệu nhận từ frontend:', req.body);

        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await new sql.Request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        if (existingUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Email đã được sử dụng!' });
        }

        // Hash mật khẩu trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu người dùng mới vào cơ sở dữ liệu
        await new sql.Request()
            .input('firstName', sql.NVarChar, firstName)
            .input('lastName', sql.NVarChar, lastName)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword) // Lưu mật khẩu đã mã hóa
            .query(
                'INSERT INTO Users (FirstName, LastName, Email, Password) VALUES (@firstName, @lastName, @email, @password)'
            );

        // Tạo JWT token
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

        // Trả về phản hồi thành công cùng token
        res.status(201).json({
            message: 'Đăng ký thành công!',
            token,
            user: { firstName, lastName, email },
        });
    } catch (err) {
        console.error('Lỗi server:', err.message);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Hàm xử lý đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc!' });
    }

    try {
        // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
        const user = await new sql.Request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query('SELECT * FROM Users WHERE Email = @email AND Password = @password');

        if (user.recordset.length === 0) {
            return res.status(400).json({ message: 'Thông tin đăng nhập không đúng!' });
        }

        // Nếu tìm thấy người dùng, tạo JWT token
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

        // Trả về phản hồi thành công với token
        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: user.recordset[0], // Trả về thông tin người dùng
        });
    } catch (err) {
        console.error('Lỗi server:', err.message);
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

