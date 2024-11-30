const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Kết nối cơ sở dữ liệu (SQL Server)
const authRoutes = require('./routes/authRoutes'); // Đường dẫn chính xác tới routes
const app = express();

// Kết nối cơ sở dữ liệu
connectDB();

// Cấu hình CORS (cho phép mọi nguồn gốc trong giai đoạn phát triển)
app.use(cors());

// Middleware để phân tích dữ liệu JSON từ yêu cầu
app.use(express.json());

// Route gốc
app.get('/', (req, res) => {
    res.send('Welcome to the API!'); // Nội dung phản hồi
});

// Sử dụng route `authRoutes` cho đường dẫn `/api/auth`
app.use('/api/auth', authRoutes);

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));
