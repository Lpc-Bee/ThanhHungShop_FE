const sql = require('mssql');
const connectDB = require('../config/db');


exports.createOrder = async (req, res) => {
  const { billingDetails, shippingAddress, cartItems } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(400).json({ message: 'Người dùng không hợp lệ!' });
  if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: 'Giỏ hàng rỗng!' });

  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Thêm đơn hàng
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const orderResult = await transaction.request()
      .input('UserID', sql.Int, userId)
      .input('TotalAmount', sql.Decimal(18, 2), totalAmount)
      .input('BillingName', sql.NVarChar, billingDetails.name)
      .input('BillingAddress', sql.NVarChar, billingDetails.address)
      .input('BillingPhone', sql.NVarChar, billingDetails.phone)
      .input('ShippingAddress', sql.NVarChar, shippingAddress.address)
      .execute('CreateOrder');

    const orderId = orderResult.recordset[0]?.OrderID;

    // Thêm chi tiết đơn hàng
    for (const item of cartItems) {
      await transaction.request()
        .input('OrderID', sql.Int, orderId)
        .input('ProductID', sql.Int, item.productId)
        .input('Quantity', sql.Int, item.quantity)
        .input('Price', sql.Decimal(18, 2), item.price)
        .execute('AddOrderDetail');
    }

    // Xóa sản phẩm trong giỏ hàng của người dùng
    await transaction.request()
      .input('UserID', sql.Int, userId)
      .execute('ClearCart'); // Gọi stored procedure xóa giỏ hàng

    await transaction.commit();
    res.status(200).json({ message: 'Đơn hàng đã được tạo thành công!', orderId });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Lỗi trong createOrder:', error.message);
    res.status(500).json({ message: '⚠️ Lỗi khi tạo đơn hàng.', error: error.message });
  } finally {
    console.log('===== DEBUG END =====');
  }
};


exports.getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    const pool = await connectDB();

    // Lấy thông tin đơn hàng
    const orderResult = await pool.request()
      .input('OrderID', sql.Int, orderId)
      .execute('GetOrderDetails'); // Gọi stored procedure

    if (!orderResult.recordset.length) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
    }

    const orderDetails = orderResult.recordset;

    res.status(200).json({
      message: 'Chi tiết đơn hàng',
      orderDetails,
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy chi tiết đơn hàng:', error.message);
    res.status(500).json({ message: 'Lỗi máy chủ.', error: error.message });
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
