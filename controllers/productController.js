const sql = require('mssql');
const config = require('../config/db');

// Hàm thực thi truy vấn SQL
const executeProductQuery = async (query, params = []) => {
    try {
        const pool = await sql.connect(config);
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

// Lấy danh sách sản phẩm với phân trang và tìm kiếm
const getProducts = async (req, res) => {
    const { limit = 10, offset = 0, brand = null } = req.query; // Thêm tham số `brand`

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Offset', sql.Int, parseInt(offset))
            .input('Limit', sql.Int, parseInt(limit))
            .input('Brand', sql.NVarChar, brand || null) // Input cho brand
            .execute('GetProducts'); // Stored procedure GetProducts cần hỗ trợ lọc brand

        const products = result.recordsets[0]; // Bảng 1: Danh sách sản phẩm
        const total = result.recordsets[1][0]?.total || 0; // Bảng 2: Tổng số sản phẩm

        res.json({ products, total });
    } catch (err) {
        console.error('Lỗi khi lấy sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};





// Thêm sản phẩm mới
const addProduct = async (req, res) => {
    const { name, description, price, stock_quantity, category, image_url, brand, is_active } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !price || !stock_quantity || !category || !brand) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin sản phẩm!' });
    }

    try {
        await executeProductQuery(
            `
            INSERT INTO Products (name, description, price, stock_quantity, category, image_url, brand, is_active)
            VALUES (@name, @description, @price, @stock_quantity, @category, @image_url, @brand, @is_active)
            `,
            [
                { name: 'name', value: name },
                { name: 'description', value: description || '' },
                { name: 'price', value: price },
                { name: 'stock_quantity', value: stock_quantity },
                { name: 'category', value: category },
                { name: 'image_url', value: image_url || '' },
                { name: 'brand', value: brand },
                { name: 'is_active', value: is_active === undefined ? true : is_active }
            ]
        );
        res.status(201).json({ message: 'Sản phẩm đã được thêm thành công!' });
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm sản phẩm!' });
    }
};


// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock_quantity, category, image_url, brand, is_active } = req.body;

    try {
        await executeProductQuery(
            `
            UPDATE Products
            SET name = @name, description = @description, price = @price,
                stock_quantity = @stock_quantity, category = @category,
                image_url = @image_url, brand = @brand, is_active = @is_active
            WHERE id = @id
            `,
            [
                { name: 'id', value: id },
                { name: 'name', value: name },
                { name: 'description', value: description },
                { name: 'price', value: price },
                { name: 'stock_quantity', value: stock_quantity },
                { name: 'category', value: category },
                { name: 'image_url', value: image_url },
                { name: 'brand', value: brand },
                { name: 'is_active', value: is_active }
            ]
        );
        res.status(200).json({ message: 'Sản phẩm đã được cập nhật!' });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    const { id } = req.params; // Lấy `id` từ URL
    try {
        await executeProductQuery('DELETE FROM Products WHERE id = @id', [
            { name: 'id', value: id },
        ]);
        res.status(200).json({ message: 'Sản phẩm đã được xóa!' });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
};
