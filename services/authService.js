const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql');

// Hàm đăng ký người dùng
const registerUser = async (firstName, lastName, email, password, role = 'user') => {
    const existingUser = await new sql.Request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM Users WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
        throw new Error('Email đã được sử dụng!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await new sql.Request()
        .input('firstName', sql.NVarChar, firstName)
        .input('lastName', sql.NVarChar, lastName)
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, hashedPassword)
        .input('role', sql.NVarChar, role)  // Gắn role cho tài khoản
        .query('INSERT INTO Users (FirstName, LastName, Email, Password, Role) VALUES (@firstName, @lastName, @email, @password, @role)');

    return { firstName, lastName, email, role };
};

// Hàm đăng nhập người dùng

const authenticateUser = async (email, password) => {
    const user = await new sql.Request()
        .input('email', sql.NVarChar, email)
        .query('SELECT id, email, password, FirstName, LastName, Role FROM Users WHERE Email = @email');

    if (!user.recordset || user.recordset.length === 0) {
        throw new Error('Không tìm thấy người dùng với email này!');
    }

    const userInfo = user.recordset[0];

    const isMatch = await bcrypt.compare(password, userInfo.password);
    if (!isMatch) {
        throw new Error('Mật khẩu không chính xác!');
    }

    const token = jwt.sign(
        { 
            id: userInfo.id, 
            email: userInfo.email, 
            firstName: userInfo.FirstName, 
            lastName: userInfo.LastName, 
            role: userInfo.Role 
        }, 
        process.env.JWT_SECRET || 'secret_key', 
        { expiresIn: '1h' }
    );

    return { token, user: userInfo };
};


// 📝 Lấy thông tin người dùng
const getUserInfo = async (id) => {
    const result = await new sql.Request()
        .input('id', sql.Int, id)
        .query('SELECT id, email, FirstName, LastName FROM Users WHERE id = @id');

    if (!result.recordset[0]) {
        throw new Error('Không tìm thấy người dùng!');
    }

    return result.recordset[0];
};

// 📝 **Xác thực token**
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
};

// 📝 **Lấy thông tin người dùng**
exports.getUserInfo = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await new sql.Request()
            .input('id', sql.Int, userId)
            .query('SELECT id, email, FirstName, LastName FROM Users WHERE id = @id');
        
        if (!result.recordset[0]) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ người dùng!' });
        }

        res.status(200).json({ user: result.recordset[0] });
    } catch (err) {
        console.error('Lỗi khi lấy hồ sơ người dùng:', err.message);
        res.status(500).json({ message: 'Lỗi máy chủ!' });
    }
};


// 📝 **Cập nhật thông tin người dùng**
const updateUserInfo = async (id, firstName, lastName) => {
    await new sql.Request()
        .input('id', sql.Int, id)
        .input('FirstName', sql.NVarChar, firstName)
        .input('LastName', sql.NVarChar, lastName)
        .query('UPDATE Users SET FirstName = @FirstName, LastName = @LastName WHERE id = @id');
};


// 📝 **Cập nhật mật khẩu người dùng**

const updateUserPassword = async (id, currentPassword, newPassword) => {
    const result = await new sql.Request()
        .input('id', sql.Int, id)
        .query('SELECT password FROM Users WHERE id = @id');

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Mật khẩu cũ không chính xác!');

    if (currentPassword === newPassword) throw new Error('Mật khẩu mới không được giống mật khẩu cũ!');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await new sql.Request()
        .input('id', sql.Int, id)
        .input('password', sql.NVarChar, hashedPassword)
        .query('UPDATE Users SET Password = @password WHERE id = @id');
};

const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        // Kiểm tra xem người dùng có tồn tại không
        const user = await new sql.Request()
            .input('id', sql.Int, userId)
            .query('SELECT * FROM Users WHERE id = @id');

        if (!user.recordset.length) {
            return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }

        // Xóa người dùng khỏi cơ sở dữ liệu
        await new sql.Request()
            .input('id', sql.Int, userId)
            .query('DELETE FROM Users WHERE id = @id');

        res.status(200).json({ message: 'Người dùng đã bị xóa thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xóa người dùng!', error: error.message });
    }
};

module.exports = { 
    getUserInfo, 
    registerUser, 
    authenticateUser, 
    verifyToken, 
    updateUserInfo, 
    updateUserPassword,
    deleteUser
};