const sql = require('mssql');
const connectDB = require('../config/db');

// Lấy số liệu tổng quan
exports.getOverviewStats = async (req, res) => {
  try {
    const pool = await connectDB();
    const statsResult = await pool.request().execute('GetOverviewStats');
    const stats = statsResult.recordset[0]; // Kết quả là một dòng dữ liệu
    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Lỗi khi lấy số liệu tổng quan:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy số liệu tổng quan' });
  }
};

exports.getOrderAnalysis = async (req, res) => {
  try {
    const pool = await connectDB();
    const orderAnalysisResult = await pool.request().execute('GetOrderAnalysis');

    // Kiểm tra dữ liệu trả về
    console.log('Kết quả trả về:', orderAnalysisResult.recordset);

    const stats = { pending: 0, completed: 0, cancelled: 0 }; // Giá trị mặc định

    // Xử lý kết quả từ stored procedure
    orderAnalysisResult.recordset.forEach((item) => {
      const status = item.Status ? item.Status.toLowerCase() : null; // Đảm bảo status không null
      if (stats.hasOwnProperty(status)) {
        stats[status] = item.Total || 0; // Gán giá trị Total
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Lỗi khi lấy phân tích đơn hàng:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy phân tích đơn hàng' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const pool = await connectDB();

    const notificationsResult = await pool.request().execute('GetNotifications');
    const notifications = notificationsResult.recordset;

    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông báo:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy thông báo' });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const pool = await connectDB();

    const recentOrdersResult = await pool.request().execute('GetRecentOrders');
    const recentOrders = recentOrdersResult.recordset;

    res.status(200).json(recentOrders);
  } catch (error) {
    console.error('❌ Lỗi khi lấy đơn hàng gần đây:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng gần đây' });
  }
};
