const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db'); // Kết nối cơ sở dữ liệu
const authRoutes = require('./routes/authRoutes'); // Route xác thực
const userRoutes = require('./routes/userRoutes'); // Route người dùng
const productRoutes = require('./routes/productRoutes'); // Route sản phẩm (public)
const adminRoutes = require('./routes/adminRoutes'); // Route admin
const orderRoutes = require('./routes/orderRoutes'); // Route đơn hàng
const cartRoutes = require('./routes/cartRoutes'); // Route giỏ hàng
const dashboardRoutes = require('./routes/dashboardRoutes'); // Route thống kê

const app = express();

// Kết nối cơ sở dữ liệu
connectDB()
    .then(() => console.log('✅ Đã kết nối cơ sở dữ liệu!'))
    .catch((err) => {
        console.error('❌ Lỗi kết nối cơ sở dữ liệu:', err);
        process.exit(1); // Dừng server nếu không kết nối được
    });

// Cấu hình CORS với các nguồn gốc được phép
const corsOptions = {
    origin: ['http://localhost:3000'], // Thay bằng domain frontend của bạn
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức được phép
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware log request (chỉ dùng trong môi trường phát triển)


// Middleware để phân tích dữ liệu JSON từ yêu cầu
app.use(express.json());

// Route gốc
app.get('/', (req, res) => {
    res.send('Chào mừng bạn đến với API!');
});

// Sử dụng các route
app.use('/api/auth', authRoutes); // Route xác thực
app.use('/api/users', userRoutes); // Route người dùng
app.use('/api/products', productRoutes); // Route public sản phẩm
app.use('/api/admin', adminRoutes); // Route admin
app.use('/api/dashboard', dashboardRoutes); // Route thống kê
app.use('/api/cart', cartRoutes); // Route giỏ hàng
app.use('/api/orders', orderRoutes); // Route đơn hàng

// Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
    console.error('❌ Lỗi toàn cục:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Lỗi server!',
    });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🌐 Server đang chạy trên cổng ${PORT}`);
});
