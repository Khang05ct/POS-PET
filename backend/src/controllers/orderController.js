const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { generateOrderCode } = require('../utils/generateCode');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const [orders] = await pool.query(`
    SELECT o.*, c.full_name as customer_name, u.full_name as user_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    JOIN users u ON o.user_id = u.id
    ORDER BY o.id DESC
  `);
  res.status(200).json(orders);
});

// @desc    Get order by id
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const [orders] = await pool.query(`
    SELECT o.*, c.full_name as customer_name, c.phone as customer_phone, u.full_name as user_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ?
  `, [req.params.id]);

  if (orders.length === 0) {
    res.status(404);
    throw new Error('Order not found');
  }

  const order = orders[0];

  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  const [payments] = await pool.query('SELECT * FROM payments WHERE order_id = ?', [order.id]);

  order.items = items;
  order.payments = payments;

  res.status(200).json(order);
});

// @desc    Create temporary order
// @route   POST /api/orders/temporary
// @access  Private
const createTemporaryOrder = asyncHandler(async (req, res) => {
  const { customer_id, items, total_amount, discount_amount, final_amount, note } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items provided');
  }

  const orderCode = generateOrderCode();

  const [result] = await pool.query(
    `INSERT INTO orders (
      order_code, customer_id, user_id, total_amount, discount_amount, final_amount, 
      payment_status, order_status, note
    ) VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', 'TEMPORARY', ?)`,
    [orderCode, customer_id || null, req.user.id, total_amount, discount_amount || 0, final_amount, note || null]
  );

  const orderId = result.insertId;

  // Insert items
  const itemsValues = items.map(item => [
    orderId, item.id, item.name, item.quantity, 
    item.selling_price, item.import_price || 0, 0, item.quantity * item.selling_price
  ]);

  await pool.query(
    'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, import_price, discount_amount, total_price) VALUES ?',
    [itemsValues]
  );

  res.status(201).json({ id: orderId, order_code: orderCode });
});

// @desc    Checkout and pay order
// @route   POST /api/orders/checkout
// @access  Private
const checkoutOrder = asyncHandler(async (req, res) => {
  const { customer_id, items, total_amount, discount_amount, final_amount, payment_method, received_amount, note } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items provided');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Check store settings
    const [settings] = await connection.query('SELECT store_status FROM store_settings LIMIT 1');
    if (settings.length > 0 && settings[0].store_status !== 'OPEN') {
      throw new Error('Store is not OPEN. Cannot process checkout.');
    }

    // 2. Validate products and stock
    const orderCode = generateOrderCode();
    let calculatedTotal = 0;
    
    for (const item of items) {
      const [products] = await connection.query('SELECT stock_quantity, status, name, import_price, low_stock_threshold FROM products WHERE id = ? FOR UPDATE', [item.id]);
      
      if (products.length === 0) {
        throw new Error(`Product ${item.name} not found`);
      }
      
      const product = products[0];
      
      if (product.status !== 'ACTIVE' && product.status !== 'OUT_OF_STOCK') {
         throw new Error(`Product ${item.name} is not available for sale`);
      }
      
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock_quantity}`);
      }
      
      item.import_price = product.import_price;
      item.low_stock_threshold = product.low_stock_threshold;
      item.before_quantity = product.stock_quantity;
      item.after_quantity = product.stock_quantity - item.quantity;
      
      calculatedTotal += item.quantity * item.selling_price;
    }

    // Use frontend total/final but backend could recalculate if strict
    const change_amount = received_amount > final_amount ? received_amount - final_amount : 0;

    // 3. Create Order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_code, customer_id, user_id, total_amount, discount_amount, final_amount, 
        payment_method, payment_status, order_status, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PAID', 'PAID', ?)`,
      [orderCode, customer_id || null, req.user.id, total_amount, discount_amount || 0, final_amount, payment_method, note || null]
    );
    
    const orderId = orderResult.insertId;

    // 4. Create Order Items and update stock and log inventory
    for (const item of items) {
      // Insert item
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, import_price, discount_amount, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.id, item.name, item.quantity, item.selling_price, item.import_price, 0, item.quantity * item.selling_price]
      );
      
      // Update product stock
      let newStatus = item.after_quantity <= 0 ? 'OUT_OF_STOCK' : 'ACTIVE';
      await connection.query(
        'UPDATE products SET stock_quantity = ?, status = ? WHERE id = ?',
        [item.after_quantity, newStatus, item.id]
      );
      
      // Inventory Transaction
      await connection.query(
        'INSERT INTO inventory_transactions (product_id, type, quantity, before_quantity, after_quantity, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [item.id, 'SALE', item.quantity, item.before_quantity, item.after_quantity, `Bán hàng HD: ${orderCode}`, req.user.id]
      );

      // Low stock alert trigger
      if (item.after_quantity <= item.low_stock_threshold) {
        req.io.emit('inventory:low-stock', {
          product_id: item.id,
          product_name: item.name,
          stock_quantity: item.after_quantity
        });
      }
    }

    // 5. Insert payment
    await connection.query(
      'INSERT INTO payments (order_id, payment_method, amount, received_amount, change_amount) VALUES (?, ?, ?, ?, ?)',
      [orderId, payment_method, final_amount, received_amount, change_amount]
    );

    // 6. Update Customer (if any)
    if (customer_id) {
      const points = Math.floor(final_amount / 10000); // 1 point per 10k
      await connection.query(
        'UPDATE customers SET total_spent = total_spent + ?, loyalty_points = loyalty_points + ? WHERE id = ?',
        [final_amount, points, customer_id]
      );
    }

    await connection.commit();

    // Emits
    req.io.emit('order:new');
    req.io.emit('dashboard:update');
    req.io.emit('inventory:update');
    req.io.emit('product:update');

    // Fetch full order to return
    const [orders] = await connection.query(`
      SELECT o.*, c.full_name as customer_name, c.phone as customer_phone, u.full_name as user_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);
    
    const finalOrder = orders[0];
    const [finalItems] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    const [finalPayments] = await connection.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
    
    finalOrder.items = finalItems;
    finalOrder.payments = finalPayments;

    res.status(201).json(finalOrder);

  } catch (error) {
    await connection.rollback();
    res.status(400);
    throw error;
  } finally {
    connection.release();
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private/Admin
const cancelOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orders] = await connection.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (orders.length === 0) {
      throw new Error('Order not found');
    }

    const order = orders[0];
    
    if (order.order_status === 'CANCELLED') {
      throw new Error('Order is already cancelled');
    }

    // Update order status
    await connection.query('UPDATE orders SET order_status = "CANCELLED" WHERE id = ?', [orderId]);

    // If order was PAID, we need to return stock
    if (order.payment_status === 'PAID') {
      const [items] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
      
      for (const item of items) {
        const [products] = await connection.query('SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        
        if (products.length > 0) {
          const currentStock = products[0].stock_quantity;
          const newStock = currentStock + item.quantity;
          
          await connection.query('UPDATE products SET stock_quantity = ?, status = "ACTIVE" WHERE id = ?', [newStock, item.product_id]);
          
          await connection.query(
            'INSERT INTO inventory_transactions (product_id, type, quantity, before_quantity, after_quantity, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [item.product_id, 'RETURN', item.quantity, currentStock, newStock, `Hủy đơn hàng: ${order.order_code}`, req.user.id]
          );
        }
      }

      if (order.customer_id) {
        const points = Math.floor(order.final_amount / 10000);
        await connection.query(
          'UPDATE customers SET total_spent = total_spent - ?, loyalty_points = loyalty_points - ? WHERE id = ?',
          [order.final_amount, points, order.customer_id]
        );
      }
    }

    await connection.commit();

    req.io.emit('order:cancelled');
    req.io.emit('dashboard:update');
    req.io.emit('inventory:update');
    req.io.emit('product:update');

    res.status(200).json({ message: 'Order cancelled successfully' });

  } catch (error) {
    await connection.rollback();
    res.status(400);
    throw error;
  } finally {
    connection.release();
  }
});

module.exports = {
  getOrders,
  getOrderById,
  createTemporaryOrder,
  checkoutOrder,
  cancelOrder
};
