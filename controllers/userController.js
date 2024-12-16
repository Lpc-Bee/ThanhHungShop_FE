const User = require('../models/User');

// Tìm người dùng theo ID (giảm lặp lại code)
const findUserById = async (id) => {
  return await User.findById(id); // MongoDB
  // Nếu sử dụng SQL, thay đổi truy vấn
  // return await pool.request().input('id', id).query('SELECT * FROM Users WHERE id = @id');
};

// Lấy danh sách người dùng
const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Tùy vào DB bạn dùng mà thay đổi query
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách người dùng.' });
  }
};

// Cập nhật vai trò người dùng
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const user = await findUserById(id); // Sử dụng hàm tìm người dùng chung
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }
    
    user.role = role;
    await user.save();
    res.status(200).json({ message: 'Vai trò người dùng đã được cập nhật thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật vai trò người dùng.' });
  }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await findUserById(id); // Sử dụng hàm tìm người dùng chung
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }
    await user.remove();
    res.status(200).json({ message: 'Người dùng đã bị xóa thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Có lỗi xảy ra khi xóa người dùng.' });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
};
