const { pool } = require('../config/db');

// Lấy số liệu tổng quan
const getOverviewStats = async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Users) AS totalUsers,
        (SELECT COUNT(*) FROM Products) AS totalProducts,
        (SELECT COUNT(*) FROM Orders) AS totalOrders,
        (SELECT SUM(total) FROM Orders WHERE status = 'Completed') AS totalRevenue
    `);
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải số liệu tổng quan' });
  }
};

module.exports = { getOverviewStats };
