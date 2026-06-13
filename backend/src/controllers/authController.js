const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin only depending on requirement, usually initial user needs public)
const registerUser = asyncHandler(async (req, res) => {
  const { full_name, email, phone, password, role } = req.body;

  if (!full_name || !email || !password) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  // Check if user exists
  const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Default role is STAFF if not provided or if not ADMIN
  const userRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF';

  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [full_name, email, phone, hashedPassword, userRole]
  );

  if (result.insertId) {
    res.status(201).json({
      id: result.insertId,
      full_name,
      email,
      role: userRole,
      token: generateToken(result.insertId)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

  if (users.length === 0) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const user = users[0];

  if (user.status === 'LOCKED') {
    res.status(403);
    throw new Error('User account is locked');
  }

  if (await bcrypt.compare(password, user.password_hash)) {
    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // In a real app, might want to blacklist the token
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser
};
