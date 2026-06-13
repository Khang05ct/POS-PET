const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const [users] = await pool.query('SELECT id, full_name, email, role, status FROM users WHERE id = ?', [decoded.id]);

      if (users.length === 0) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (users[0].status === 'LOCKED') {
        res.status(403);
        throw new Error('User account is locked');
      }

      req.user = users[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
