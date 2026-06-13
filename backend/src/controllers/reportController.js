const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard metrics
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardMetrics = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  
  // Today's revenue & orders
  const [todayStats] = await pool.query(`
    SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(final_amount), 0) as total_revenue
    FROM orders 
    WHERE DATE(created_at) = ? AND payment_status = 'PAID' AND order_status = 'PAID'
  `, [today]);

  // This month's revenue
  const [monthStats] = await pool.query(`
    SELECT COALESCE(SUM(final_amount), 0) as total_revenue
    FROM orders 
    WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
    AND YEAR(created_at) = YEAR(CURRENT_DATE())
    AND payment_status = 'PAID' AND order_status = 'PAID'
  `);

  // Inventory value (Tổng giá trị kho)
  const [inventoryStats] = await pool.query(`
    SELECT COALESCE(SUM(import_price * stock_quantity), 0) as total_value
    FROM products WHERE status != 'INACTIVE'
  `);

  // Customers count
  const [customerStats] = await pool.query(`
    SELECT COUNT(*) as total_customers FROM customers
  `);

  // Low stock products
  const [lowStockProducts] = await pool.query(`
    SELECT id, product_code, name, stock_quantity, low_stock_threshold 
    FROM products 
    WHERE stock_quantity <= low_stock_threshold AND status != 'INACTIVE'
    ORDER BY stock_quantity ASC
    LIMIT 5
  `);

  // Last 7 days revenue trend
  const [revenueTrend] = await pool.query(`
    SELECT DATE(created_at) as date, COALESCE(SUM(final_amount), 0) as revenue
    FROM orders
    WHERE created_at >= DATE(NOW()) - INTERVAL 6 DAY
    AND payment_status = 'PAID' AND order_status = 'PAID'
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `);

  // Recent orders
  const [recentOrders] = await pool.query(`
    SELECT o.id, o.order_code, o.final_amount, o.created_at, o.payment_method, c.full_name as customer_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.order_status = 'PAID'
    ORDER BY o.id DESC
    LIMIT 5
  `);

  res.status(200).json({
    today_revenue: todayStats[0].total_revenue,
    today_orders: todayStats[0].total_orders,
    month_revenue: monthStats[0].total_revenue,
    inventory_value: inventoryStats[0].total_value,
    total_customers: customerStats[0].total_customers,
    low_stock_products: lowStockProducts,
    revenue_trend: revenueTrend,
    recent_orders: recentOrders
  });
});

// @desc    Get top selling products
// @route   GET /api/reports/best-selling
// @access  Private
const getBestSelling = asyncHandler(async (req, res) => {
  const [products] = await pool.query(`
    SELECT product_id, product_name, SUM(quantity) as total_sold
    FROM order_items
    JOIN orders ON order_items.order_id = orders.id
    WHERE orders.order_status = 'PAID'
    GROUP BY product_id, product_name
    ORDER BY total_sold DESC
    LIMIT 10
  `);
  res.status(200).json(products);
});

// @desc    Get payment methods stats
// @route   GET /api/reports/payment-methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
  const [methods] = await pool.query(`
    SELECT payments.payment_method, COALESCE(SUM(payments.amount), 0) as total_amount, COUNT(*) as count
    FROM payments
    JOIN orders ON payments.order_id = orders.id
    WHERE orders.order_status = 'PAID'
    GROUP BY payments.payment_method
  `);
  res.status(200).json(methods);
});

module.exports = {
  getDashboardMetrics,
  getBestSelling,
  getPaymentMethods
};
