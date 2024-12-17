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

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ProductID và Quantity.' });
    }

    const pool = await connectDB();
    
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .input('Quantity', sql.Int, quantity)
      .execute('AddOrUpdateCartItem');

    res.status(200).json({ message: '✅ Sản phẩm đã được thêm vào giỏ hàng' });
  } catch (error) {
    console.error('❌ Lỗi thêm sản phẩm vào giỏ hàng:', error.message);
    res.status(500).json({ message: 'Lỗi thêm sản phẩm vào giỏ hàng', error });
  }
};
exports.updateQuantity = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;

    if (!cartItemId || !quantity) {
      return res.status(400).json({ message: 'cartItemId và quantity là bắt buộc!' });
    }

    // Đảm bảo số lượng nằm trong khoảng từ 1 đến 10
    const updatedQuantity = Math.max(1, Math.min(10, quantity));

    const pool = await connectDB();
    
    // Kiểm tra xem sản phẩm có tồn tại trong CartItems không
    const result = await pool.request()
      .input('CartItemID', sql.Int, cartItemId)
      .input('Quantity', sql.Int, updatedQuantity)
      .execute('UpdateCartItemQuantity'); // Gọi stored procedure

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng.' });
    }

    // Lấy lại giỏ hàng đã cập nhật để gửi về frontend
    const cartResult = await pool.request()
      .input('UserID', sql.Int, req.user.id)
      .execute('GetCart');

    res.status(200).json(cartResult.recordset); // Trả về giỏ hàng mới
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật số lượng sản phẩm:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật số lượng sản phẩm!', error });
  }
};

exports.getCart = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token không hợp lệ!' });

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
  try {
    const { cartItemId } = req.params; // Lấy ID từ URL
    const userId = req.user.id; // Lấy UserID từ token

    if (!cartItemId) {
      return res.status(400).json({ message: 'cartItemId không hợp lệ!' });
    }

    const pool = await connectDB();

    // Xóa sản phẩm trong CartItems
    const deleteResult = await pool.request()
      .input('CartItemID', sql.Int, cartItemId)
      .execute('RemoveCartItem'); // Gọi stored procedure xóa

    if (deleteResult.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại trong giỏ hàng.' });
    }

    // Lấy lại giỏ hàng sau khi xóa
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .execute('GetCart');

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error.message);
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng.', error });
  }
};
