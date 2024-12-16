const jwt = require('jsonwebtoken');
const sql = require('mssql');
const connectDB  = require('../config/db');

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?.id; // ✅ Lấy UserID từ token
    const { productId, quantity } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'UserID không tồn tại. Vui lòng đăng nhập!' });
    }

    // Kết nối tới cơ sở dữ liệu
    const pool = await connectDB(); // 🔥 connectDB() trả về `pool`
    
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .input('Quantity', sql.Int, quantity)
      .execute('AddOrUpdateCartItem'); // ✅ Gọi Stored Procedure

    res.status(200).json({ message: '✅ Sản phẩm đã được thêm vào giỏ hàng' });
  } catch (error) {
    console.error('❌ Lỗi thêm sản phẩm vào giỏ hàng:', error.message);
    res.status(500).json({ message: 'Lỗi thêm sản phẩm vào giỏ hàng', error });
  }
};


exports.getCart = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token không được cung cấp!' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const userId = decoded.id;

    const pool = await connectDB();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .execute('GetCart');

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('❌ Lỗi lấy giỏ hàng:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy giỏ hàng!' });
  }
};



exports.removeFromCart = async (req, res) => {
  const { cartItemId } = req.params;
  try {
    await connectDB();
    await sql.request()
      .input('CartItemID', sql.Int, cartItemId)
      .execute('RemoveFromCart');
    
    const result = await sql.request()
      .input('UserID', sql.Int, req.body.userId)
      .execute('GetCart');

    res.status(200).json(result.recordset); // Trả về giỏ hàng đã cập nhật
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa sản phẩm khỏi giỏ hàng', error });
  }
};
