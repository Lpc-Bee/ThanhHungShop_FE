const sql = require('mssql');

// Cấu hình kết nối
const config = {
    server: 'LAPTOP-6EHRF80A\\LPC', // Tên server
    database: 'ShopNuocHoa',       // Tên database (bạn đã tạo)
    user: 'lpchuong',               // Tên tài khoản đăng nhập
    password: '123',       // Mật khẩu
    options: {
        encrypt: false,             // Tắt mã hóa nếu không dùng SSL
        trustServerCertificate: true, // Cần thiết nếu không dùng chứng chỉ SSL
    }
};
// Hàm kết nối với SQL Server
const connectDB = async () => {
    try {
        const pool = await sql.connect(config);
        console.log('✅ Kết nối SQL Server thành công');
        return pool; // 🔥 Trả về pool kết nối
    } catch (err) {
        console.error('❌ Lỗi kết nối SQL Server:', err.message);
        process.exit(1);
    }
};

// Export module
module.exports = connectDB; 