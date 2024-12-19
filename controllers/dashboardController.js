const sql = require('mssql');
const config = require('../config/db');

const getOverviewStats = async (req, res) => {
  try {
    const pool = await sql.connect(config); // Kết nối SQL Server
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Users) AS totalUsers,
        (SELECT COUNT(*) FROM Products) AS totalProducts,
        (SELECT COUNT(*) FROM Orders) AS totalOrders,
        (SELECT SUM(total_amount) FROM Orders WHERE status = 'Completed') AS totalRevenue
    `);
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('Lỗi khi lấy số liệu tổng quan:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy số liệu tổng quan' });
  }
};



module.exports = { getOverviewStats };
