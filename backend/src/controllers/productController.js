const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const [products] = await pool.query(`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    ORDER BY p.id DESC
  `);
  res.status(200).json(products);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const [products] = await pool.query(`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ?
  `, [req.params.id]);

  if (products.length === 0) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json(products[0]);
});

// @desc    Search products
// @route   GET /api/products/search?keyword=
// @access  Private
const searchProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword || '';
  const [products] = await pool.query(`
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE (p.name LIKE ? OR p.product_code LIKE ? OR p.barcode LIKE ?) 
    AND p.status = 'ACTIVE'
    ORDER BY p.name ASC
    LIMIT 20
  `, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);

  res.status(200).json(products);
});

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Private
const getProductByBarcode = asyncHandler(async (req, res) => {
  const { barcode } = req.params;
  const [products] = await pool.query('SELECT * FROM products WHERE barcode = ? AND status = "ACTIVE"', [barcode]);
  
  if (products.length === 0) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json(products[0]);
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private
const getLowStockProducts = asyncHandler(async (req, res) => {
  const [products] = await pool.query(`
    SELECT * FROM products 
    WHERE stock_quantity <= low_stock_threshold 
    AND status != 'INACTIVE'
  `);
  res.status(200).json(products);
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { 
    product_code, barcode, name, category_id, brand, 
    import_price, selling_price, unit, stock_quantity, 
    low_stock_threshold, description 
  } = req.body;

  if (!product_code || !name || !selling_price) {
    res.status(400);
    throw new Error('Please provide required fields (product_code, name, selling_price)');
  }

  const [existing] = await pool.query('SELECT id FROM products WHERE product_code = ?', [product_code]);
  if (existing.length > 0) {
    res.status(400);
    throw new Error('Product code already exists');
  }

  let status = 'ACTIVE';
  if (stock_quantity <= 0) {
    status = 'OUT_OF_STOCK';
  }

  const [result] = await pool.query(
    `INSERT INTO products (
      product_code, barcode, name, category_id, brand, 
      import_price, selling_price, unit, stock_quantity, 
      low_stock_threshold, description, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product_code, barcode, name, category_id || null, brand, 
      import_price || 0, selling_price, unit || 'Cái', stock_quantity || 0, 
      low_stock_threshold || 5, description, status
    ]
  );

  req.io.emit('product:update');
  
  res.status(201).json({
    id: result.insertId,
    message: 'Product created successfully'
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const { 
    product_code, barcode, name, category_id, brand, 
    import_price, selling_price, unit, low_stock_threshold, 
    description, status 
  } = req.body;

  const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
  if (product.length === 0) {
    res.status(404);
    throw new Error('Product not found');
  }

  await pool.query(
    `UPDATE products SET 
      product_code = ?, barcode = ?, name = ?, category_id = ?, brand = ?, 
      import_price = ?, selling_price = ?, unit = ?,  
      low_stock_threshold = ?, description = ?, status = ?
    WHERE id = ?`,
    [
      product_code, barcode, name, category_id || null, brand, 
      import_price, selling_price, unit, 
      low_stock_threshold, description, status, productId
    ]
  );

  req.io.emit('product:update');

  res.status(200).json({ message: 'Product updated successfully' });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
  if (product.length === 0) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if product exists in order_items
  const [orderItems] = await pool.query('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [productId]);
  if (orderItems.length > 0) {
    res.status(400);
    throw new Error('Cannot delete product that has been sold. Consider changing status to INACTIVE.');
  }

  await pool.query('DELETE FROM products WHERE id = ?', [productId]);
  
  req.io.emit('product:update');

  res.status(200).json({ message: 'Product removed' });
});

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  getProductByBarcode,
  getLowStockProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
