const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get inventory transactions history
// @route   GET /api/inventory/history
// @access  Private
const getInventoryHistory = asyncHandler(async (req, res) => {
  const [history] = await pool.query(`
    SELECT t.*, p.name as product_name, p.product_code, u.full_name as user_name 
    FROM inventory_transactions t
    JOIN products p ON t.product_id = p.id
    LEFT JOIN users u ON t.created_by = u.id
    ORDER BY t.id DESC
    LIMIT 100
  `);
  res.status(200).json(history);
});

// @desc    Import inventory
// @route   POST /api/inventory/import
// @access  Private/Admin
const importInventory = asyncHandler(async (req, res) => {
  const { product_id, quantity, import_price, note } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Valid Product ID and quantity are required');
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const [product] = await connection.query('SELECT stock_quantity, status FROM products WHERE id = ? FOR UPDATE', [product_id]);
    if (product.length === 0) {
      throw new Error('Product not found');
    }

    const currentStock = product[0].stock_quantity;
    const newStock = currentStock + parseInt(quantity);
    
    let newStatus = product[0].status;
    if (newStatus === 'OUT_OF_STOCK' && newStock > 0) {
      newStatus = 'ACTIVE';
    }

    // Update product stock and optionally import price
    const updateQuery = import_price 
      ? 'UPDATE products SET stock_quantity = ?, import_price = ?, status = ? WHERE id = ?'
      : 'UPDATE products SET stock_quantity = ?, status = ? WHERE id = ?';
    
    const updateParams = import_price 
      ? [newStock, import_price, newStatus, product_id]
      : [newStock, newStatus, product_id];

    await connection.query(updateQuery, updateParams);

    // Insert transaction record
    await connection.query(
      'INSERT INTO inventory_transactions (product_id, type, quantity, before_quantity, after_quantity, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [product_id, 'IMPORT', quantity, currentStock, newStock, note || 'Nhập hàng', req.user.id]
    );

    await connection.commit();
    
    req.io.emit('inventory:update');
    req.io.emit('product:update');
    
    res.status(200).json({ message: 'Inventory imported successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(400);
    throw error;
  } finally {
    connection.release();
  }
});

// @desc    Adjust inventory
// @route   POST /api/inventory/adjust
// @access  Private/Admin
const adjustInventory = asyncHandler(async (req, res) => {
  const { product_id, new_quantity, note } = req.body;

  if (!product_id || new_quantity === undefined || new_quantity < 0) {
    res.status(400);
    throw new Error('Valid Product ID and new quantity are required');
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const [product] = await connection.query('SELECT stock_quantity, status FROM products WHERE id = ? FOR UPDATE', [product_id]);
    if (product.length === 0) {
      throw new Error('Product not found');
    }

    const currentStock = product[0].stock_quantity;
    const diff = new_quantity - currentStock;
    
    if (diff === 0) {
      await connection.rollback();
      res.status(400).json({ message: 'No adjustment needed' });
      return;
    }

    let newStatus = product[0].status;
    if (newStatus === 'OUT_OF_STOCK' && new_quantity > 0) {
      newStatus = 'ACTIVE';
    } else if (new_quantity === 0) {
      newStatus = 'OUT_OF_STOCK';
    }

    // Update product stock
    await connection.query(
      'UPDATE products SET stock_quantity = ?, status = ? WHERE id = ?',
      [new_quantity, newStatus, product_id]
    );

    // Insert transaction record
    await connection.query(
      'INSERT INTO inventory_transactions (product_id, type, quantity, before_quantity, after_quantity, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [product_id, 'ADJUSTMENT', diff, currentStock, new_quantity, note || 'Điều chỉnh kho', req.user.id]
    );

    await connection.commit();
    
    req.io.emit('inventory:update');
    req.io.emit('product:update');
    
    res.status(200).json({ message: 'Inventory adjusted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(400);
    throw error;
  } finally {
    connection.release();
  }
});

module.exports = {
  getInventoryHistory,
  importInventory,
  adjustInventory
};
