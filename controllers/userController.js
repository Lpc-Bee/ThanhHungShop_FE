const User = require('../models/User');
const sql = require('mssql');
const connectDB = require('../config/db');

// Tìm người dùng theo ID (giảm lặp lại code)
const findUserById = async (id) => {
  return await User.findById(id); // MongoDB
  // Nếu sử dụng SQL, thay đổi truy vấn
  // return await pool.request().input('id', id).query('SELECT * FROM Users WHERE id = @id');
};

// Lấy danh sách người dùng
const getUsers = async (req, res) => {
  const { page = 1, size = 10, search = '' } = req.query;

  try {
    const pool = await connectDB();
    const offset = (page - 1) * size;

    const users = await pool.request()
    .input('PageNumber', sql.Int, page)
    .input('PageSize', sql.Int, size)
    .input('Search', sql.NVarChar, search)
    .execute('GetUsers');

    console.log('Kết quả từ stored procedure:', users.recordset);


    const totalUsersResult = await pool.request()
      .input('Search', sql.NVarChar, search)
      .query('SELECT COUNT(*) AS TotalUsers FROM Users WHERE FirstName LIKE @Search OR LastName LIKE @Search OR Email LIKE @Search');

    const totalUsers = totalUsersResult.recordset[0].TotalUsers;
    const totalPages = Math.ceil(totalUsers / size);

    res.status(200).json({
      users: users.recordset,
      totalPages,
    });
  } catch (error) {
    console.error('❌ Lỗi Backend:', error.message); // Log lỗi tại đây
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách người dùng.', error: error.message });
  }
};


// Cập nhật vai trò người dùng
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  console.log('Cập nhật vai trò cho ID:', id, 'Vai trò mới:', role);

  try {
    const pool = await connectDB();
    await pool.request()
      .input('UserID', sql.Int, id)
      .input('Role', sql.NVarChar, role)
      .execute('UpdateUserRole'); // Gọi stored procedure để cập nhật vai trò

    res.status(200).json({ message: 'Vai trò người dùng đã được cập nhật.' });
  } catch (error) {
    console.error('Lỗi Backend:', error.message);
    res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật vai trò.' });
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
