const sql = require('mssql');
const connectDB = require('../config/db');

exports.addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    await connectDB(); // Kết nối với SQL Server
    await sql.request()
      .input('UserID', sql.Int, userId)
      .input('ProductID', sql.Int, productId)
      .input('Quantity', sql.Int, quantity)
      .execute('AddToCart');
      
    res.status(200).json({ message: '✅ Sản phẩm đã được thêm vào giỏ hàng' });
  } catch (error) {
    console.error('❌ Lỗi thêm sản phẩm vào giỏ hàng:', error.message);
    res.status(500).json({ message: 'Lỗi thêm sản phẩm vào giỏ hàng', error });
  }
};

exports.getCart = async (req, res) => {
  const { userId } = req.query;
  try {
    await connectDB(); // Kết nối với SQL Server
    const result = await sql.request()
      .input('UserID', sql.Int, userId)
      .execute('GetCart');
      
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('❌ Lỗi lấy giỏ hàng:', error.message);
    res.status(500).json({ message: 'Lỗi lấy giỏ hàng', error });
  }
};

exports.removeFromCart = async (req, res) => {
  const { cartItemId } = req.params;
  try {
    await connectDB(); // Kết nối với SQL Server
    await sql.request()
      .input('CartItemID', sql.Int, cartItemId)
      .execute('RemoveFromCart');
      
    res.status(200).json({ message: '✅ Sản phẩm đã được xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('❌ Lỗi xóa sản phẩm khỏi giỏ hàng:', error.message);
    res.status(500).json({ message: 'Lỗi xóa sản phẩm khỏi giỏ hàng', error });
  }
};
