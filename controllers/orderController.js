const sql = require('mssql');
const connectDB = require('../config/db');

exports.createOrder = async (req, res) => {
  const { userId } = req.body;
  try {
    await connectDB(); // Kết nối với SQL Server
    const result = await sql.request()
      .input('UserID', sql.Int, userId)
      .execute('CreateOrder');
      
    res.status(200).json({ 
      message: '✅ Đơn hàng đã được tạo thành công', 
      orderId: result.returnValue 
    });
  } catch (error) {
    console.error('❌ Lỗi tạo đơn hàng:', error.message);
    res.status(500).json({ message: 'Lỗi tạo đơn hàng', error });
  }
};

exports.payOrder = async (req, res) => {
  const { orderId } = req.params;
  const { paymentMethod } = req.body;
  try {
    await connectDB(); // Kết nối với SQL Server
    await sql.request()
      .input('OrderID', sql.Int, orderId)
      .input('PaymentMethod', sql.NVarChar, paymentMethod)
      .execute('PaymentOrder');
      
    res.status(200).json({ message: '✅ Thanh toán thành công' });
  } catch (error) {
    console.error('❌ Lỗi thanh toán:', error.message);
    res.status(500).json({ message: 'Lỗi thanh toán', error });
  }
};
