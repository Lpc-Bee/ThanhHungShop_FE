const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Kết nối cơ sở dữ liệu
const authRoutes = require('./routes/authRoutes'); // Route xác thực
const userRoutes = require('./routes/userRoutes'); // Route người dùng
const productRoutes = require('./routes/productRoutes'); // Route sản phẩm
const orderRoutes = require('./routes/orderRoutes'); // Route đơn hàng
const cartRoutes = require('./routes/cartRoutes'); 
const dashboardRoutes = require('./routes/dashboardRoutes'); // Route thống kê

const app = express();

// Kết nối cơ sở dữ liệu
connectDB();

// Cấu hình CORS (cho phép mọi nguồn gốc trong giai đoạn phát triển)
app.use(cors());

// Middleware để phân tích dữ liệu JSON từ yêu cầu
app.use(express.json());

// Route gốc
app.get('/', (req, res) => {
    res.send('Chào mừng bạn đến với API!');
});

// Sử dụng route `authRoutes` cho đường dẫn `/api/auth`
app.use('/api/auth', authRoutes);

// Sử dụng các route khác
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cart', cartRoutes); // Route cho giỏ hàng
app.use('/api/orders', orderRoutes); // Route cho đơn hàng


// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
