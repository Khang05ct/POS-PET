const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, lockUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, adminOnly, getUsers)
  .post(protect, adminOnly, createUser);

router.route('/:id')
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

router.put('/:id/lock', protect, adminOnly, lockUser);

module.exports = router;
