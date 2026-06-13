const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const [users] = await pool.query('SELECT id, full_name, email, phone, role, status, created_at FROM users ORDER BY id DESC');
  res.status(200).json(users);
});

// @desc    Create new user (admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { full_name, email, phone, password, role } = req.body;

  if (!full_name || !email || !password) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF';

  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [full_name, email, phone, hashedPassword, userRole]
  );

  res.status(201).json({
    id: result.insertId,
    full_name,
    email,
    role: userRole
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { full_name, phone, role } = req.body;
  const userId = req.params.id;

  const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  await pool.query(
    'UPDATE users SET full_name = ?, phone = ?, role = ? WHERE id = ?',
    [full_name, phone, role, userId]
  );

  res.status(200).json({ message: 'User updated successfully' });
});

// @desc    Lock/Unlock user
// @route   PUT /api/users/:id/lock
// @access  Private/Admin
const lockUser = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'ACTIVE' or 'LOCKED'
  const userId = req.params.id;

  if(userId == req.user.id) {
    res.status(400);
    throw new Error('Cannot lock your own account');
  }

  const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
  
  res.status(200).json({ message: `User account ${status.toLowerCase()} successfully` });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if(userId == req.user.id) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  res.status(200).json({ message: 'User removed' });
});

module.exports = {
  getUsers,
  createUser,
  updateUser,
  lockUser,
  deleteUser
};
