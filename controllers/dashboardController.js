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
exports.getRevenueStats = async (req, res) => {
  const { filter } = req.query; // filter = 'today', 'month', 'year'
  try {
    const pool = await connectDB();

    let query = '';
    if (filter === 'today') {
      query = `SELECT SUM(total_amount) AS revenue 
               FROM Orders 
               WHERE status = 'Completed' AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)`;
    } else if (filter === 'month') {
      query = `SELECT SUM(total_amount) AS revenue 
               FROM Orders 
               WHERE status = 'Completed' AND MONTH(created_at) = MONTH(GETDATE()) AND YEAR(created_at) = YEAR(GETDATE())`;
    } else if (filter === 'year') {
      query = `SELECT SUM(total_amount) AS revenue 
               FROM Orders 
               WHERE status = 'Completed' AND YEAR(created_at) = YEAR(GETDATE())`;
    }

    const result = await pool.request().query(query);
    res.status(200).json({ revenue: result.recordset[0]?.revenue || 0 });
  } catch (error) {
    console.error('❌ Lỗi khi lấy thống kê doanh thu:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê doanh thu.' });
  }
};
exports.getAllOrders = async (req, res) => {
  const { page = 1, size = 10, status, search } = req.query;

  try {
    const pool = await connectDB();

    let query = `SELECT * FROM Orders WHERE 1=1 `;
    if (status) query += `AND status = @status `;
    if (search) query += `AND (billing_name LIKE '%' + @search + '%' OR id LIKE '%' + @search + '%') `;

    query += `ORDER BY created_at DESC OFFSET @offset ROWS FETCH NEXT @size ROWS ONLY`;

    const result = await pool.request()
      .input('status', sql.NVarChar, status)
      .input('search', sql.NVarChar, search)
      .input('offset', sql.Int, (page - 1) * size)
      .input('size', sql.Int, size)
      .query(query);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách đơn hàng:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng.' });
  }
};
exports.getOrdersByDate = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('startDate', sql.DateTime, startDate)
      .input('endDate', sql.DateTime, endDate)
      .query(`SELECT * FROM Orders WHERE created_at BETWEEN @startDate AND @endDate`);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('❌ Lỗi khi lấy đơn hàng theo thời gian:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy đơn hàng theo thời gian.' });
  }
};
