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
    const result = await pool.request()
      .input('OrderID', sql.Int, orderId)
      .execute('GetOrderDetails');

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
    }

    res.status(200).json({
      orderId: result.recordset[0].OrderID,
      customer: result.recordset[0].CustomerName,
      total: result.recordset[0].TotalAmount,
      status: result.recordset[0].Status,
      items: result.recordset.map((item) => ({
        productId: item.ProductID,
        productName: item.ProductName,
        quantity: item.Quantity,
        price: item.Price,
      })),
    });
  } catch (error) {
    console.error('Lỗi Backend:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng.', error: error.message });
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
exports.getAllOrders = async (req, res) => {
  const { page = 1, size = 10 } = req.query;

  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('PageNumber', sql.Int, page)
      .input('PageSize', sql.Int, size)
      .execute('GetAllOrders');

    // Định dạng lại dữ liệu trả về
    const orders = result.recordset.map(order => ({
      id: order.OrderID,
      customer: order.CustomerName,
      total: order.TotalAmount,
      status: order.Status,
    }));

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log('OrderID:', id);
  console.log('Status:', status);

  if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
  }

  try {
    const pool = await connectDB();
    await pool.request()
      .input('OrderID', sql.Int, id)
      .input('Status', sql.NVarChar, status)
      .execute('UpdateOrderStatus');

    res.status(200).json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error) {
    console.error('❌ Lỗi Backend:', error.message);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await connectDB();
    await pool.request()
      .input('OrderID', sql.Int, id)
      .execute('DeleteOrder'); // Gọi stored procedure xóa đơn hàng

    res.status(200).json({ message: 'Xóa đơn hàng thành công!' });
  } catch (error) {
    console.error('Lỗi Backend:', error.message);
    res.status(500).json({ message: 'Lỗi khi xóa đơn hàng.', error: error.message });
  }
};
