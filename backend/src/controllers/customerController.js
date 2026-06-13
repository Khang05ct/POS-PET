const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const [customers] = await pool.query('SELECT * FROM customers ORDER BY id DESC');
  res.status(200).json(customers);
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = asyncHandler(async (req, res) => {
  const [customers] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);

  if (customers.length === 0) {
    res.status(404);
    throw new Error('Customer not found');
  }

  res.status(200).json(customers[0]);
});

// @desc    Search customers
// @route   GET /api/customers/search?keyword=
// @access  Private
const searchCustomers = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword || '';
  const [customers] = await pool.query(
    'SELECT * FROM customers WHERE full_name LIKE ? OR phone LIKE ? ORDER BY full_name ASC LIMIT 20',
    [`%${keyword}%`, `%${keyword}%`]
  );

  res.status(200).json(customers);
});

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  const { full_name, phone, email, address, note } = req.body;

  if (!full_name) {
    res.status(400);
    throw new Error('Full name is required');
  }

  if (phone) {
    const [existing] = await pool.query('SELECT id FROM customers WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      res.status(400);
      throw new Error('Phone number already exists');
    }
  }

  const [result] = await pool.query(
    'INSERT INTO customers (full_name, phone, email, address, note) VALUES (?, ?, ?, ?, ?)',
    [full_name, phone || null, email || null, address || null, note || null]
  );

  res.status(201).json({
    id: result.insertId,
    full_name,
    phone,
    email,
    address,
    loyalty_points: 0,
    total_spent: 0
  });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  const customerId = req.params.id;
  const { full_name, phone, email, address, note } = req.body;

  const [customer] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);
  if (customer.length === 0) {
    res.status(404);
    throw new Error('Customer not found');
  }

  await pool.query(
    'UPDATE customers SET full_name = ?, phone = ?, email = ?, address = ?, note = ? WHERE id = ?',
    [full_name, phone || null, email || null, address || null, note || null, customerId]
  );

  res.status(200).json({ message: 'Customer updated successfully' });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = asyncHandler(async (req, res) => {
  const customerId = req.params.id;

  const [customer] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);
  if (customer.length === 0) {
    res.status(404);
    throw new Error('Customer not found');
  }

  // Set customer_id to NULL in orders instead of blocking deletion, 
  // schema handles this via ON DELETE SET NULL if we change it or we can just delete
  // But standard is keeping orders. So let's delete
  await pool.query('DELETE FROM customers WHERE id = ?', [customerId]);

  res.status(200).json({ message: 'Customer removed' });
});

module.exports = {
  getCustomers,
  getCustomerById,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
