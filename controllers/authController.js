    const { 
        registerUser, 
        authenticateUser, 
        verifyToken, 
        getUserInfo, 
        updateUserInfo, 
        updateUserPassword 
    } = require('../services/authService');

    // Hàm xử lý đăng ký
    exports.register = async (req, res) => {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin!' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ!' });
        }

        try {
            const user = await registerUser(firstName, lastName, email, password);
            res.status(201).json({
                message: 'Đăng ký thành công!',
                user,
            });
        } catch (err) {
            console.error('Lỗi đăng ký:', err.message);
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    };
    exports.login = async (req, res) => {
        const { email, password } = req.body;
    
        if (!email || !password) {
            return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc!' });
        }
    
        try {
            const { token, user } = await authenticateUser(email, password);
    
            // Đảm bảo rằng token và user được gửi lại cho client
            res.status(200).json({
                message: 'Đăng nhập thành công!',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.FirstName,
                    lastName: user.LastName,
                },
            });
        } catch (err) {
            console.error('Lỗi đăng nhập:', err.message);
    
            if (err.message === 'Không tìm thấy người dùng với email này!' || 
                err.message === 'Mật khẩu không chính xác!') {
                return res.status(401).json({ message: err.message });
            }
    
            res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại sau!' });
        }
    };
   // Hàm xác thực token
    exports.verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header

    if (!token) {
        return res.status(403).json({ message: 'Token không hợp lệ' });
    }

    try {
        // Giải mã token và lấy thông tin người dùng
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decoded;  // Lưu thông tin người dùng vào request

        next();  // Chuyển tiếp request tới các hàm xử lý tiếp theo
    } catch (err) {
        console.error('Token không hợp lệ hoặc hết hạn:', err.message);
        res.status(403).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }
};


    // 📝 Lấy thông tin người dùng
    exports.getUserInfo = async (req, res) => {
        try {
            const user = await getUserInfo(req.user.id); // Lấy thông tin người dùng từ `req.user.id`
            res.status(200).json({ user });
        } catch (err) {
            console.error('Lỗi khi lấy thông tin người dùng:', err.message);
            res.status(500).json({ message: 'Lỗi máy chủ!' });
        }
    };

    // 📝 Cập nhật thông tin người dùng
    exports.updateUserInfo = async (req, res) => {
        try {
            const { firstName, lastName } = req.body;
            await updateUserInfo(req.user.id, firstName, lastName);
            res.status(200).json({ message: 'Cập nhật thông tin thành công!' });
        } catch (err) {
            console.error('Lỗi cập nhật thông tin người dùng:', err.message);
            res.status(500).json({ message: 'Lỗi máy chủ!' });
        }
    };

    // 📝 Cập nhật mật khẩu
    exports.updatePassword = async (req, res) => {
        try {
            await updateUserPassword(req.user.id, req.body.currentPassword, req.body.newPassword);
            res.status(200).json({ message: 'Cập nhật mật khẩu thành công!' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    };

    // 📝 Xóa tài khoản người dùng
    exports.deleteAccount = async (req, res) => {
        try {
            await deleteAccount(req.user.id);
            res.status(200).json({ message: 'Xóa tài khoản thành công!' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    };