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
    const { id, name, limit = 10, offset = 0 } = req.query;
    try {
        if (id) {
            const product = await executeProductQuery(
                'SELECT * FROM Products WHERE id = @id',
                [{ name: 'id', value: id }]
            );

            if (!product.length) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }
            return res.json(product[0]);
        }

        // Lấy danh sách sản phẩm với phân trang
        const query = `
            SELECT * FROM Products
            WHERE (@name IS NULL OR name LIKE '%' + @name + '%')
            ORDER BY created_at DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        const products = await executeProductQuery(query, [
            { name: 'name', value: name || null },
            { name: 'limit', value: parseInt(limit) },
            { name: 'offset', value: parseInt(offset) },
        ]);

        // Lấy tổng số lượng sản phẩm
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM Products
            WHERE (@name IS NULL OR name LIKE '%' + @name + '%')
        `;
        const totalResult = await executeProductQuery(countQuery, [
            { name: 'name', value: name || null },
        ]);

        const total = totalResult[0]?.total || 0;

        res.json({
            products,
            total,
        });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


// Thêm sản phẩm mới
const addProduct = async (req, res) => {
    const { name, description, price, stock_quantity, category, image_url, brand, is_active } = req.body;
    try {
        await executeProductQuery(
            `
            INSERT INTO Products (name, description, price, stock_quantity, category, image_url, brand, is_active)
            VALUES (@name, @description, @price, @stock_quantity, @category, @image_url, @brand, @is_active)
            `,
            [
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
        res.status(201).json({ message: 'Sản phẩm đã được thêm!' });
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server' });
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
    const { id } = req.params;
    try {
        await executeProductQuery('DELETE FROM Products WHERE id = @id', [{ name: 'id', value: id }]);
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
