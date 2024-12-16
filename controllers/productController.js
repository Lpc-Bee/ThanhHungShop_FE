const sql = require('mssql');
const config = require('../config/db'); // File cấu hình kết nối

const executeProductQuery = async (query, params = []) => {
    try {
        const pool = await sql.connect(config); // Kết nối trực tiếp
        const request = pool.request();

        params.forEach(param => {
            request.input(param.name, param.value);
        });

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('Lỗi khi thực hiện truy vấn:', error);
        throw error;
    }
};

// Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
    const productId = req.query.id; // Lấy ID từ query
    try {
        if (productId) {
            // Nếu có ID, trả về chi tiết sản phẩm
            const product = await executeProductQuery('SELECT * FROM Products WHERE id = @id', [
                { name: 'id', value: productId }
            ]);

            if (!product || product.length === 0) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }
           
        // Kiểm tra URL hình ảnh từ SQL Server (image đã là URL đầy đủ từ internet)
        console.log('URL hình ảnh:', product[0].image_url);
            return res.json(product[0]); // Trả về sản phẩm
        }

        // Nếu không có ID, trả về danh sách sản phẩm
        const products = await executeProductQuery('SELECT * FROM Products');
        res.json(products);
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        // Truy vấn SQL để xóa sản phẩm
        await executeProductQuery('DELETE FROM Products WHERE id = @id', [{ name: 'id', value: productId }]);
        res.status(200).json({ message: 'Sản phẩm đã được xóa!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
    }
};

module.exports = getProducts, deleteProduct, executeProductQuery ;
