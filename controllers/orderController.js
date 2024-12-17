const sql = require('mssql');
const connectDB = require('../config/db');


exports.createOrder = async (req, res) => {
  try {
    const { billingDetails, shippingAddress, cartItems, totalAmount } = req.body;
    const userId = req.user.id;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng rỗng!' });
    }

    const pool = await connectDB();
    if (!pool.connected) {
      console.error('❌ Không thể kết nối với cơ sở dữ liệu.');
      return res.status(500).json({ message: 'Kết nối cơ sở dữ liệu thất bại.' });
    }

    // 1️⃣ Tạo đơn hàng
    const orderResult = await pool.request()
  .input('UserID', sql.Int, userId)
  .input('TotalAmount', sql.Decimal(18,2), totalAmount)
  .input('BillingName', sql.NVarChar, billingDetails.name)
  .input('BillingAddress', sql.NVarChar, billingDetails.address)
  .input('BillingPhone', sql.NVarChar, billingDetails.phone)
  .input('ShippingAddress', sql.NVarChar, shippingAddress.address)
  .execute('CreateOrder');

if (!orderResult.recordset || orderResult.recordset.length === 0) {
  return res.status(500).json({ message: 'Không thể tạo đơn hàng!' });
}

    const orderId = orderResult.recordset[0].OrderID;

    // 2️⃣ Thêm chi tiết sản phẩm
    for (const item of cartItems) {
      if (!item.productId || !item.quantity || !item.price) {
        return res.status(400).json({ message: 'Dữ liệu sản phẩm không hợp lệ!' });
      }

      await pool.request()
        .input('OrderID', sql.Int, orderId)
        .input('ProductID', sql.Int, item.productId)
        .input('Quantity', sql.Int, item.quantity)
        .input('Price', sql.Decimal(18,2), item.price)
        .execute('AddOrderDetail');
    }

    // 3️⃣ Trả về kết quả
    res.status(200).json({
      message: 'Đơn hàng đã được tạo thành công!',
      orderId,
      totalAmount,
      items: cartItems
    });
  } catch (error) {
    console.error('❌ Lỗi khi tạo đơn hàng:', error.message);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng.', error: error.message });
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
