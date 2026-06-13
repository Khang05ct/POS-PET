const express = require('express');
const router = express.Router();
const { 
  getOrders, getOrderById, createTemporaryOrder, 
  checkoutOrder, cancelOrder 
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getOrders);

router.post('/temporary', protect, createTemporaryOrder);
router.post('/checkout', protect, checkoutOrder);

router.route('/:id')
  .get(protect, getOrderById);

router.put('/:id/cancel', protect, adminOnly, cancelOrder);

module.exports = router;
