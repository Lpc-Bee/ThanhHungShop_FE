const sql = require('mssql');
const connectDB = require('../config/db');


exports.createOrder = async (req, res) => {
  const { billingDetails, shippingAddress, cartItems } = req.body;
  const userId = req.user?.id;

  console.log('===== DEBUG START =====');
  console.log('Received Request Body:', req.body);
  console.log('User ID:', userId);

  // 1. Kiểm tra dữ liệu nhập vào
  if (!userId) return res.status(400).json({ message: 'Người dùng không hợp lệ!' });
  if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: 'Giỏ hàng rỗng!' });

  // 2. Tính tổng tiền và kiểm tra dữ liệu
  let totalAmountBackend = 0;
  for (const item of cartItems) {
    const price = parseFloat(item.price);
    const quantity = parseInt(item.quantity);
    if (!item.productId || price <= 0 || quantity <= 0) {
      console.error('❌ Sản phẩm không hợp lệ:', item);
      return res.status(400).json({ message: `Sản phẩm không hợp lệ: ${JSON.stringify(item)}` });
    }
    totalAmountBackend += price * quantity;
  }

  console.log('📊 Tổng tiền tính lại (Backend):', totalAmountBackend);

  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 3. Thêm đơn hàng
    const orderResult = await transaction.request()
      .input('UserID', sql.Int, userId)
      .input('TotalAmount', sql.Decimal(18, 2), totalAmountBackend)
      .input('BillingName', sql.NVarChar, billingDetails.name)
      .input('BillingAddress', sql.NVarChar, billingDetails.address)
      .input('BillingPhone', sql.NVarChar, billingDetails.phone)
      .input('ShippingAddress', sql.NVarChar, shippingAddress.address)
      .execute('CreateOrder');

    const orderId = orderResult.recordset[0]?.OrderID;
    if (!orderId) throw new Error('Không thể tạo đơn hàng.');

    // 4. Thêm chi tiết sản phẩm
    for (const item of cartItems) {
      await transaction.request()
        .input('OrderID', sql.Int, orderId)
        .input('ProductID', sql.Int, item.productId)
        .input('Quantity', sql.Int, item.quantity)
        .input('Price', sql.Decimal(18, 2), item.price)
        .execute('AddOrderDetail');
    }

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
